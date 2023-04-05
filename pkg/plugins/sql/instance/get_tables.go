package instance

type TablesQuery interface {
	Query() string
}

type postgresTablesQuery struct{}

func (p postgresTablesQuery) Query() string {
	return "\\dt"
}

type mysqlTablesQuery struct{}

func (p mysqlTablesQuery) Query() string {
	return "\\dt"
}

type clickhouseTablesQuery struct{}

func (p clickhouseTablesQuery) Query() string {
	return "SHOW TABLES"
}
