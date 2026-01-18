package models

type Recipient struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"uniqueIndex;not null" json:"userId"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID;references:ID" json:"user"`

	Age       *int    `json:"age"`
	Condition *string `gorm:"type:text" json:"condition"`
	Likes     *string `gorm:"type:text" json:"likes"`
	Dislikes  *string `gorm:"type:text" json:"dislikes"`
	Phobias   *string `gorm:"type:text" json:"phobias"`
	PetPeeves *string `gorm:"type:text" json:"petPeeves"`
}

type RecipientRequest struct {
	Name      *string `json:"name"` // goes to users table
	Age       *int    `json:"age"`
	Condition *string `json:"condition"`
	Likes     *string `json:"likes"`
	Dislikes  *string `json:"dislikes"`
	Phobias   *string `json:"phobias"`
	PetPeeves *string `json:"petPeeves"`
}

type RecipientReturned struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"userId"`
	Name   string `json:"name"`

	Age       *int    `json:"age"`
	Condition *string `json:"condition"`
	Likes     *string `json:"likes"`
	Dislikes  *string `json:"dislikes"`
	Phobias   *string `json:"phobias"`
	PetPeeves *string `json:"petPeeves"`
}
type RecipientWithRequest struct {
	Recipient
	RequestStatus *CareRequestStatus `json:"requestStatus"`
	RequestID     *uint              `json:"requestId"`
}
