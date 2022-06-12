package jwt

import (
	"testing"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"

	"github.com/stretchr/testify/require"
)

func TestValidateToken(t *testing.T) {
	token1, _ := CreateToken(authContext.User{Email: "user1@kobs.io"}, "sessionToken", time.Duration(48*time.Hour))
	_, err := ValidateToken(token1, "wrongSessionToken")
	require.Error(t, err)

	token2 := "eyJhbGciOiJQUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.W0vasx0Lxmn3hkfi3RjJSLDSZnZbqDRZy6fau8wvIm_sdtTCiSJAjMSO1eR8YbnUF_MD10JYwR5unI8JO_qB8uSrW5vg4OPCDuPSQQu0Pnf9Q2Cy3WqSK166lgidlwAqyijgPFp5ggOnJM20IY4F8W6HOqcGeXcRzsaM2DIBEnku32TM7Xb-aCJYdKtawEfvD1zEwE1of02BoGva3sf_RhijMZpOA3yIG3FCDll-3M1rILP9Bi4FPz_uOAbJkKvUirAdaMX-KNaw6T_0nnBwHaFc8M9GGVZV6bT4uaOQ1U0Ezi4SAcBWW8kkPKZNorpRC5EtO_X6uvIVazj5EHERuw"
	_, err = ValidateToken(token2, "sessionToken")
	require.Error(t, err)
}

func TestCreateToken(t *testing.T) {
	token, err := CreateToken(authContext.User{Email: "user1@kobs.io"}, "sessionToken", time.Duration(48*time.Hour))
	require.NoError(t, err)
	user, err := ValidateToken(token, "sessionToken")
	require.NoError(t, err)
	require.Equal(t, authContext.User{Email: "user1@kobs.io"}, *user)

	_, err = CreateToken(authContext.User{Email: "user1@kobs.io"}, "sessionToken", time.Duration(-48*time.Hour))
	require.Error(t, err)
}
