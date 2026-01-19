package models

type UserRole string

const (
	RoleCaregiver UserRole = "caregiver"
	RoleRecipient UserRole = "recipient"
)

type User struct {
	ID           uint     `gorm:"primaryKey" json:"id"`
	Username     string   `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string   `gorm:"not null" json:"-"`
	Name         string   `gorm:"not null" json:"name"`
	Role         UserRole `gorm:"type:varchar(20);not null" json:"role"`
}

type UpdateUserNameRequest struct {
	Name string `json:"name" binding:"required"`
}
