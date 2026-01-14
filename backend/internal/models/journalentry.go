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
	ID          string   `gorm:"type:uuid;primaryKey" json:"id"`
	RecipientID uint     `gorm:"not null;index" json:"recipientId"` // FK -> recipients.id
	Content     string   `gorm:"type:text;not null" json:"content"`
	Mood        MoodType `gorm:"type:varchar(20);not null" json:"mood"`
	CreatedAt   time.Time `json:"createdAt"`
}
