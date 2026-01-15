package models

import "time"

type Comment struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	JournalEntryID uint      `gorm:"not null;index" json:"journalEntryId"`
	AuthorID       uint      `gorm:"not null;index" json:"authorId"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	CreatedAt      time.Time `json:"createdAt"`
}

type CommentReturned struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	JournalEntryID uint      `gorm:"not null;index" json:"journalEntryId"`
	AuthorID       uint      `gorm:"not null;index" json:"authorId"`
	AuthorName     string    `json:"authorName"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	CreatedAt      time.Time `json:"createdAt"`
	AuthorRole     string    `json:"authorRole"` // "caregiver" or "recipient"
}
