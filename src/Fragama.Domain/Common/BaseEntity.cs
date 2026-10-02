using System;

namespace Fragama.Domain.Common
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    public abstract class AuditableEntity : BaseEntity
    {
        public int? CreatedByUserId { get; set; }
        public int? UpdatedByUserId { get; set; }
    }
}
