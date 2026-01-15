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
	Caregiver   Caregiver `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:CaregiverID;references:ID" json:"caregiver"`
	Recipient   Recipient `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:RecipientID;references:ID" json:"recipient"`

	Status      CareRequestStatus `gorm:"type:varchar(20);not null;default:'pending';index" json:"status"`

	RequestedAt time.Time `json:"requestedAt"`
	RespondedAt *time.Time `json:"respondedAt"`
}
