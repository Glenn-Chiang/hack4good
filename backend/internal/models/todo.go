package models

import "time"

type TodoPriority string

const (
	PriorityLow    TodoPriority = "low"
	PriorityMedium TodoPriority = "medium"
	PriorityHigh   TodoPriority = "high"
)

type Todo struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Title       string       `gorm:"not null" json:"title"`
	Description string       `gorm:"type:text;not null" json:"description"`
	DueDate     time.Time    `gorm:"not null;index" json:"dueDate"`
	Completed   bool         `gorm:"not null;default:false" json:"completed"`

	RecipientID uint `gorm:"not null;index" json:"recipientId"` // FK -> recipients.id
	CaregiverID uint `gorm:"not null;index" json:"caregiverId"` // FK -> caregivers.id

	Priority TodoPriority `gorm:"type:varchar(10);not null" json:"priority"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
