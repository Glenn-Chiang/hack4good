package models

import "time"

type CaregiverRecipient struct {
	ID uint `gorm:"primaryKey" json:"id"`

	CaregiverID uint      `gorm:"not null;index;uniqueIndex:uniq_caregiver_recipient" json:"caregiverId"`
	RecipientID uint      `gorm:"not null;index;uniqueIndex:uniq_caregiver_recipient" json:"recipientId"`
	CreatedAt   time.Time `json:"createdAt"`
}
