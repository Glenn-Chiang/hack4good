package models

type Recipient struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"uniqueIndex;not null"`
	User      User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID;references:ID"`
	
	Age       *int    `gorm:""`
	Condition *string `gorm:"type:text"`
	Likes     *string `gorm:"type:text"`
	Dislikes  *string `gorm:"type:text"`
	Phobias   *string `gorm:"type:text"`
	PetPeeves *string `gorm:"type:text"`
}
