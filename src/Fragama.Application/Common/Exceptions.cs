using System;

namespace Fragama.Application.Common
{
    public class AppException : Exception
    {
        public AppException(string message) : base(message) { }
    }

    public class NotFoundException : AppException
    {
        public NotFoundException(string entityName, object key) 
            : base($"El registro '{entityName}' con identificador '{key}' no fue encontrado.") { }
    }

    public class InsufficientStockException : AppException
    {
        public InsufficientStockException(string productSku, int requested, int available)
            : base($"Stock insuficiente para el producto [{productSku}]. Solicitado: {requested}, Disponible: {available}.") { }
    }

    public class BusinessRuleException : AppException
    {
        public BusinessRuleException(string message) : base(message) { }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Operación exitosa")
            => new ApiResponse<T> { Success = true, Message = message, Data = data };

        public static ApiResponse<T> Fail(string message, List<string>? errors = null)
            => new ApiResponse<T> { Success = false, Message = message, Errors = errors };
    }
}
