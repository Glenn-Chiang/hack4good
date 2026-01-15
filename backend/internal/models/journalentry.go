package models

import "time"

type MoodType string

const (
	MoodHappy   MoodType = "happy"
	MoodSad     MoodType = "sad"
	MoodAngry   MoodType = "angry"
	MoodAnxious MoodType = "anxious"
)

type JournalEntry struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	RecipientID uint     `gorm:"not null;index" json:"recipientId"`
	Recipient   Recipient `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:RecipientID;references:ID" json:"recipient"`
	Content     string   `gorm:"type:text;not null" json:"content"`
	Mood        MoodType `gorm:"type:varchar(20);not null" json:"mood"`
	CreatedAt   time.Time `json:"createdAt"`
}
