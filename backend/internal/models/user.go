package models

type User struct {
	ID        uint      `gorm:"primaryKey"`
	Username     string    `gorm:"uniqueIndex;not null"`
	PasswordHash string `gorm:"not null"`
	Name      string    `gorm:"not null"`
}
