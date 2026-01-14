package models

type Recipient struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"uniqueIndex;not null" json:"userId"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID;references:ID"`

	Age       *int    `json:"age"`
	Condition *string `gorm:"type:text" json:"condition"`
	Likes     *string `gorm:"type:text" json:"likes"`
	Dislikes  *string `gorm:"type:text" json:"dislikes"`
	Phobias   *string `gorm:"type:text" json:"phobias"`
	PetPeeves *string `gorm:"type:text" json:"petPeeves"`
}
