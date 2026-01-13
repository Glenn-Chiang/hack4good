package models

type UserRole string

const (
	RoleCaregiver UserRole = "caregiver"
	RoleRecipient UserRole = "recipient"
)

type User struct {
	ID        uint      `gorm:"primaryKey"`
	Username     string    `gorm:"uniqueIndex;not null"`
	PasswordHash string `gorm:"not null"`
	Name      string    `gorm:"not null"`
	Role      UserRole `gorm:"type:varchar(20);not null"`
}
