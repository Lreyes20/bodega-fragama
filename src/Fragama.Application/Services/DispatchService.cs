using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.Common;
using Fragama.Application.DTOs;
using Fragama.Application.Interfaces;
using Fragama.Domain.Entities;
using Fragama.Domain.Enums;
using Fragama.Domain.Interfaces;

namespace Fragama.Application.Services
{
    public class DispatchService : IDispatchService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IInventoryService _inventoryService;

        public DispatchService(IUnitOfWork unitOfWork, IInventoryService inventoryService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _inventoryService = inventoryService ?? throw new ArgumentNullException(nameof(inventoryService));
        }

        public async Task<IReadOnlyList<DispatchOrderDto>> GetDriverRouteAsync(int driverId, CancellationToken cancellationToken = default)
        {
            var dispatches = await _unitOfWork.Dispatches.GetActiveDispatchesByDriverAsync(driverId, cancellationToken);
            
            return dispatches.Select(d => MapToDto(d)).ToList();
        }

        public async Task<DispatchOrderDto> VerifyCargoBeforeDepartureAsync(int dispatchId, int driverId, CancellationToken cancellationToken = default)
        {
            var dispatch = await _unitOfWork.Dispatches.GetWithDetailsAsync(dispatchId, cancellationToken);
            if (dispatch == null)
                throw new NotFoundException(nameof(DispatchOrder), dispatchId);

            if (dispatch.DriverId != driverId)
                throw new BusinessRuleException("No tiene autorización para verificar una orden asignada a otra unidad de transporte.");

            foreach (var item in dispatch.Items)
            {
                item.IsVerifiedByDriver = true;
            }

            dispatch.Status = DispatchStatus.EnRuta;
            dispatch.DepartureTime = DateTime.UtcNow;

            await _unitOfWork.Dispatches.UpdateAsync(dispatch, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            return MapToDto(dispatch);
        }

        public async Task<DispatchOrderDto> UpdateDeliveryStatusAsync(
            int dispatchId, 
            UpdateDispatchStatusDto dto, 
            int driverId, 
            CancellationToken cancellationToken = default)
        {
            var dispatch = await _unitOfWork.Dispatches.GetWithDetailsAsync(dispatchId, cancellationToken);
            if (dispatch == null)
                throw new NotFoundException(nameof(DispatchOrder), dispatchId);

            if (dispatch.DriverId != driverId)
                throw new BusinessRuleException("No tiene permisos para modificar el estado de este despacho.");

            dispatch.Status = dto.NewStatus;
            dispatch.ObservationNotes = dto.ObservationNotes;
            dispatch.RecipientSignatureUrl = dto.RecipientSignatureBase64;
            dispatch.UpdatedAt = DateTime.UtcNow;

            if (dto.NewStatus == DispatchStatus.Entregado)
            {
                dispatch.DeliveredTime = DateTime.UtcNow;
                // Marcar cantidades entregadas completas
                foreach (var item in dispatch.Items)
                {
                    item.QuantityDelivered = item.QuantityShipped;
                }
            }
            else if (dto.NewStatus == DispatchStatus.Rechazado)
            {
                // Si la mercadería fue rechazada en ruta, se reingresa a inventario como devolución de cliente
                foreach (var item in dispatch.Items)
                {
                    await _inventoryService.RegisterMovementAsync(new StockMovementRequestDto
                    {
                        ProductId = item.ProductId,
                        MovementType = MovementTypeEnum.DevolucionCliente,
                        Quantity = item.QuantityShipped,
                        ReferenceDocument = $"DEV-{dispatch.DispatchCode}",
                        Notes = $"Mercancía devuelta por cliente. Observación chofer: {dto.ObservationNotes}"
                    }, driverId, cancellationToken);
                }
            }
            else if (dto.NewStatus == DispatchStatus.Observado && dto.DeliveredItems != null)
            {
                // Entrega parcial con observaciones
                foreach (var checkedItem in dto.DeliveredItems)
                {
                    var item = dispatch.Items.FirstOrDefault(i => i.ProductId == checkedItem.ProductId);
                    if (item != null)
                    {
                        item.QuantityDelivered = checkedItem.QuantityDelivered;
                        int rejectedQty = item.QuantityShipped - checkedItem.QuantityDelivered;
                        if (rejectedQty > 0)
                        {
                            // Reingresar el remanente rechazado al Kardex
                            await _inventoryService.RegisterMovementAsync(new StockMovementRequestDto
                            {
                                ProductId = item.ProductId,
                                MovementType = MovementTypeEnum.DevolucionCliente,
                                Quantity = rejectedQty,
                                ReferenceDocument = $"DEV-PARCIAL-{dispatch.DispatchCode}",
                                Notes = $"Devolución parcial. Observación chofer: {dto.ObservationNotes}"
                            }, driverId, cancellationToken);
                        }
                    }
                }
            }

            await _unitOfWork.Dispatches.UpdateAsync(dispatch, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            return MapToDto(dispatch);
        }

        private static DispatchOrderDto MapToDto(DispatchOrder d)
        {
            return new DispatchOrderDto
            {
                DispatchOrderId = d.Id,
                DispatchCode = d.DispatchCode,
                DriverName = d.Driver?.FullName ?? "Chofer",
                VehiclePlate = d.VehiclePlate,
                InvoiceNumber = d.Invoice?.InvoiceNumber ?? "N/A",
                CustomerName = d.Invoice?.Customer?.BusinessName ?? "Cliente Fragama",
                DeliveryAddress = d.DeliveryAddress,
                ContactRecipient = d.ContactRecipient,
                ContactPhone = d.ContactPhone,
                Status = d.Status.ToString(),
                DepartureTime = d.DepartureTime,
                DeliveredTime = d.DeliveredTime,
                ObservationNotes = d.ObservationNotes,
                Items = d.Items.Select(i => new DispatchItemDto
                {
                    ItemId = i.Id,
                    ProductId = i.ProductId,
                    ProductSku = i.Product?.Sku ?? "",
                    ProductName = i.Product?.Name ?? "Producto",
                    QuantityShipped = i.QuantityShipped,
                    QuantityDelivered = i.QuantityDelivered,
                    IsVerifiedByDriver = i.IsVerifiedByDriver
                }).ToList()
            };
        }
    }
}
