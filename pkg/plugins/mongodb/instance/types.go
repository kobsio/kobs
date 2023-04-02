package instance

type DBStats struct {
	Db                   string  `bson:"db" json:"db"`
	Collections          int64   `bson:"collections" json:"collections"`
	Views                int64   `bson:"views" json:"views"`
	Objects              int64   `bson:"objects" json:"objects"`
	AvgObjSize           float64 `bson:"avgObjSize" json:"avgObjSize"`
	DataSize             int64   `bson:"dataSize" json:"dataSize"`
	StorageSize          int64   `bson:"storageSize" json:"storageSize"`
	FreeStorageSize      int64   `bson:"freeStorageSize" json:"freeStorageSize"`
	Indexes              int64   `bson:"indexes" json:"indexes"`
	IndexSize            int64   `bson:"indexSize" json:"indexSize"`
	IndexFreeStorageSize int64   `bson:"indexFreeStorageSize" json:"indexFreeStorageSize"`
	TotalSize            int64   `bson:"totalSize" json:"totalSize"`
	TotalFreeStorageSize int64   `bson:"totalFreeStorageSize" json:"totalFreeStorageSize"`
	ScaleFactor          int64   `bson:"scaleFactor" json:"scaleFactor"`
	FsUsedSize           int64   `bson:"fsUsedSize" json:"fsUsedSize"`
	FsTotalSize          int64   `bson:"fsTotalSize" json:"fsTotalSize"`
}

type CollectionStats struct {
	Ns              string  `bson:"ns" json:"ns"`
	Size            int64   `bson:"size" json:"size"`
	Count           int64   `bson:"count" json:"count"`
	AvgObjSize      float64 `bson:"avgObjSize" json:"avgObjSize"`
	NumOrphanDocs   int64   `bson:"numOrphanDocs" json:"numOrphanDocs"`
	StorageSize     int64   `bson:"storageSize" json:"storageSize"`
	FreeStorageSize int64   `bson:"freeStorageSize" json:"freeStorageSize"`
	Nindexes        int64   `bson:"nindexes" json:"nindexes"`
	TotalIndexSize  int64   `bson:"totalIndexSize" json:"totalIndexSize"`
	TotalSize       int64   `bson:"totalSize" json:"totalSize"`
}
