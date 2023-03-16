package instance

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	i := New("rss", http.DefaultClient)
	require.Equal(t, "rss", i.GetName())

}

func TestGetFeed(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
	}))
	defer ts.Close()

	i := New("rss", http.DefaultClient)
	feed, err := i.GetFeed(ts.URL)
	require.NoError(t, err)
	require.Equal(t, "Staffbase Status - Incident History", feed.Title)
}
