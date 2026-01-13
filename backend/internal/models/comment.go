package models

import "time"

type Comment struct {
	ID          string   `gorm:"type:uuid;primaryKey" json:"id"`
	JournalEntryID uint     `gorm:"not null;index" json:"journalEntryId"`
	AuthorID uint `gorm:"not null;index" json:"authorId"`
	Content     string   `gorm:"type:text;not null" json:"content"`
	CreatedAt   time.Time `json:"createdAt"`
}
