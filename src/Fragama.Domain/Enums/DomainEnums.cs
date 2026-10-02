namespace Fragama.Domain.Enums
{
    public enum MovementTypeEnum
    {
        EntradaCompra = 1,
        SalidaVenta = 2,
        TrasladoInterno = 3,
        AjustePositivo = 4,
        AjusteNegativo = 5,
        DevolucionCliente = 6
    }

    public enum DispatchStatus
    {
        Asignado = 1,
        EnRuta = 2,
        Entregado = 3,
        Rechazado = 4,
        Observado = 5
    }

    public enum PaymentMethod
    {
        Efectivo = 1,
        Tarjeta = 2,
        Transferencia = 3,
        Credito = 4
    }

    public static class RolesConstant
    {
        public const string Administrador = "Administrador";
        public const string Bodeguero = "Bodeguero";
        public const string Cajero = "Cajero";
        public const string Chofer = "Chofer";
    }
}
