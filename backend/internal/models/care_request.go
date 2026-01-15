package models

import "time"

type CareRequestStatus string

const (
	CareRequestPending  CareRequestStatus = "pending"
	CareRequestAccepted CareRequestStatus = "accepted"
	CareRequestRejected CareRequestStatus = "rejected"
)

type CareRequest struct {
	ID uint `gorm:"primaryKey" json:"id"`

	CaregiverID uint `gorm:"not null;index;uniqueIndex:uniq_request_pair" json:"caregiverId"`
	RecipientID uint `gorm:"not null;index;uniqueIndex:uniq_request_pair" json:"recipientId"`
	Status      CareRequestStatus `gorm:"type:varchar(20);not null;default:'pending';index" json:"status"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
