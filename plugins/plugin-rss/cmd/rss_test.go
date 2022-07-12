package rss

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-rss/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	mockInstance := &instance.MockInstance{}
	mockInstance.On("GetName").Return("rss")

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("rss")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestGetFeed(t *testing.T) {
	for _, tt := range []struct {
		name               string
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
		handlerfFunc       func(w http.ResponseWriter, r *http.Request)
		expectedStatusCode int
		expectedBody       func(url string) string
	}{
		{
			name: "invalid instance name",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getFeed(w, req)
			},
			handlerfFunc: func(w http.ResponseWriter, r *http.Request) {
			},
			expectedStatusCode: http.StatusBadRequest,
			expectedBody: func(url string) string {
				return "{\"error\":\"Could not find instance name\"}\n"
			},
		},
		{
			name: "no urls",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req.Header.Set("x-kobs-plugin", "rss")
				router.getFeed(w, req)
			},
			handlerfFunc: func(w http.ResponseWriter, r *http.Request) {
			},
			expectedStatusCode: http.StatusOK,
			expectedBody: func(url string) string {
				return "null\n"
			},
		},
		{
			name: "could not parse url",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req.Header.Set("x-kobs-plugin", "rss")
				router.getFeed(w, req)
			},
			handlerfFunc: func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusBadRequest)
			},
			expectedStatusCode: http.StatusOK,
			expectedBody: func(url string) string {
				return "null\n"
			},
		},
		{
			name: "get feed",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req.Header.Set("x-kobs-plugin", "rss")
				router.getFeed(w, req)
			},
			handlerfFunc: func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/rss+xml; charset=utf-8")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>
				<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
				  <channel>
					<title>Staffbase Status - Incident History</title>
					<link>https://status.staffbase.com</link>
					<description>Statuspage</description>
					<pubDate>Fri, 24 Dec 2021 00:46:18 +0100</pubDate>
					<item>
					  <title>Blank content</title>
					  <description>
				&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;23&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;10:30&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Resolved&lt;/strong&gt; - The issue is resolved. We apologize for the inconvenience this has caused. Please get in touch with us at support@staffbase.com in case you still find pages without content. We're happy to help!&lt;br /&gt;&lt;br /&gt;We wish everyone a nice and relaxing Christmas!!&lt;/p&gt;&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;22&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;16:16&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Update&lt;/strong&gt; - We are continuing to monitor for any further issues.&lt;/p&gt;&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;22&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;12:58&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Monitoring&lt;/strong&gt; - We have just implemented a fix which gradually should recover all pages. We will continue to monitor the systems until we are sure the issue is fully resolved.&lt;/p&gt;&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;22&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;11:58&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Update&lt;/strong&gt; - We have found the cause for the behaviour causing blank pages, and are preparing a fix that should be in place soon.&lt;/p&gt;&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;22&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;11:12&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Investigating&lt;/strong&gt; - Customers may be experiencing blanked out content pages within their applications. This behaviour can affect customers on our German as well as international server. &lt;br /&gt;&lt;br /&gt;Our teams are investigating and will work to resolve this as fast as we can. We will share more information soon.&lt;br /&gt;&lt;br /&gt;We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.&lt;/p&gt;      </description>
					  <pubDate>Thu, 23 Dec 2021 10:30:37 +0100</pubDate>
					  <link>https://status.staffbase.com/incidents/77004ltfxlkv</link>
					  <guid>https://status.staffbase.com/incidents/77004ltfxlkv</guid>
					</item>
					<item>
					  <title>Service disruption with the German media server</title>
					  <description>
				&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;20&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;09:42&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Resolved&lt;/strong&gt; - This incident has been resolved. We are sorry for the trouble this has caused.
				&lt;br /&gt;
				&lt;br /&gt;Please contact us at support@staffbase.com should you experience any further issues. We're happy to help!&lt;/p&gt;&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;17&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;17:14&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Monitoring&lt;/strong&gt; - We have identified the root cause and the Video Upload should be working again.  &lt;br /&gt;We will continue to monitor the systems during the next hours. We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.&lt;/p&gt;&lt;p&gt;&lt;small&gt;Dec &lt;var data-var=&apos;date&apos;&gt;17&lt;/var&gt;, &lt;var data-var=&apos;time&apos;&gt;13:38&lt;/var&gt; CET&lt;/small&gt;&lt;br&gt;&lt;strong&gt;Investigating&lt;/strong&gt; - We have received reports that some customers may be experiencing long loading times or error while uploading videos.&lt;br /&gt;Our teams are investigating and will work to resolve this as fast as we can. We will share more information soon.&lt;br /&gt;We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.&lt;/p&gt;      </description>
					  <pubDate>Mon, 20 Dec 2021 09:42:32 +0100</pubDate>
					  <link>https://status.staffbase.com/incidents/p3mdb34gmrx6</link>
					  <guid>https://status.staffbase.com/incidents/p3mdb34gmrx6</guid>
					</item>
				  </channel>
				</rss>`))
			},
			expectedStatusCode: http.StatusOK,
			expectedBody: func(url string) string {
				return "[{\"feedTitle\":\"Staffbase Status - Incident History\",\"feedLink\":\"" + url + "\",\"title\":\"Blank content\",\"description\":\"\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e23\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e10:30\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eResolved\\u003c/strong\\u003e - The issue is resolved. We apologize for the inconvenience this has caused. Please get in touch with us at support@staffbase.com in case you still find pages without content. We're happy to help!\\u003cbr /\\u003e\\u003cbr /\\u003eWe wish everyone a nice and relaxing Christmas!!\\u003c/p\\u003e\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e22\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e16:16\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eUpdate\\u003c/strong\\u003e - We are continuing to monitor for any further issues.\\u003c/p\\u003e\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e22\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e12:58\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eMonitoring\\u003c/strong\\u003e - We have just implemented a fix which gradually should recover all pages. We will continue to monitor the systems until we are sure the issue is fully resolved.\\u003c/p\\u003e\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e22\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e11:58\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eUpdate\\u003c/strong\\u003e - We have found the cause for the behaviour causing blank pages, and are preparing a fix that should be in place soon.\\u003c/p\\u003e\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e22\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e11:12\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eInvestigating\\u003c/strong\\u003e - Customers may be experiencing blanked out content pages within their applications. This behaviour can affect customers on our German as well as international server. \\u003cbr /\\u003e\\u003cbr /\\u003eOur teams are investigating and will work to resolve this as fast as we can. We will share more information soon.\\u003cbr /\\u003e\\u003cbr /\\u003eWe apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.\\u003c/p\\u003e\",\"link\":\"https://status.staffbase.com/incidents/77004ltfxlkv\",\"links\":[\"https://status.staffbase.com/incidents/77004ltfxlkv\"],\"updated\":1640251837,\"published\":1640251837},{\"feedTitle\":\"Staffbase Status - Incident History\",\"feedLink\":\"" + url + "\",\"title\":\"Service disruption with the German media server\",\"description\":\"\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e20\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e09:42\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eResolved\\u003c/strong\\u003e - This incident has been resolved. We are sorry for the trouble this has caused.\\n\\t\\t\\t\\t\\u003cbr /\\u003e\\n\\t\\t\\t\\t\\u003cbr /\\u003ePlease contact us at support@staffbase.com should you experience any further issues. We're happy to help!\\u003c/p\\u003e\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e17\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e17:14\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eMonitoring\\u003c/strong\\u003e - We have identified the root cause and the Video Upload should be working again.  \\u003cbr /\\u003eWe will continue to monitor the systems during the next hours. We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.\\u003c/p\\u003e\\u003cp\\u003e\\u003csmall\\u003eDec \\u003cvar data-var='date'\\u003e17\\u003c/var\\u003e, \\u003cvar data-var='time'\\u003e13:38\\u003c/var\\u003e CET\\u003c/small\\u003e\\u003cbr\\u003e\\u003cstrong\\u003eInvestigating\\u003c/strong\\u003e - We have received reports that some customers may be experiencing long loading times or error while uploading videos.\\u003cbr /\\u003eOur teams are investigating and will work to resolve this as fast as we can. We will share more information soon.\\u003cbr /\\u003eWe apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.\\u003c/p\\u003e\",\"link\":\"https://status.staffbase.com/incidents/p3mdb34gmrx6\",\"links\":[\"https://status.staffbase.com/incidents/p3mdb34gmrx6\"],\"updated\":1639989752,\"published\":1639989752}]\n"
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			ts := httptest.NewServer(http.HandlerFunc(tt.handlerfFunc))
			defer ts.Close()

			i := instance.New("rss", ts.Client())
			router := Router{chi.NewRouter(), []instance.Instance{i}}
			router.Get("/feed", router.getFeed)

			req, _ := http.NewRequest(http.MethodGet, "/feed?url="+ts.URL, nil)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody(ts.URL), string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router, err := Mount([]plugin.Instance{{Name: "rss"}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router)
}
