package feed

import (
	"testing"
	"time"

	"github.com/mmcdole/gofeed"
	"github.com/stretchr/testify/require"
)

var feeds = []*gofeed.Feed{
	{
		Title:           "Staffbase Status - Incident History",
		Description:     "Statuspage",
		Link:            "https://status.staffbase.com",
		FeedLink:        "",
		Links:           []string{"https://status.staffbase.com"},
		Image:           &gofeed.Image{URL: "test.png"},
		Updated:         "",
		UpdatedParsed:   nil,
		Published:       "Fri, 24 Dec 2021 00:46:18 +0100",
		PublishedParsed: testTimePointer(time.Date(2021, time.December, 23, 23, 46, 18, 0, time.UTC)),
		Items: []*gofeed.Item{
			{
				Title:           "Blank content",
				Description:     "<p><small>Dec <var data-var='date'>23</var>, <var data-var='time'>10:30</var> CET</small><br><strong>Resolved</strong> - The issue is resolved. We apologize for the inconvenience this has caused. Please get in touch with us at support@staffbase.com in case you still find pages without content. We're happy to help!<br /><br />We wish everyone a nice and relaxing Christmas!!</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>16:16</var> CET</small><br><strong>Update</strong> - We are continuing to monitor for any further issues.</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>12:58</var> CET</small><br><strong>Monitoring</strong> - We have just implemented a fix which gradually should recover all pages. We will continue to monitor the systems until we are sure the issue is fully resolved.</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>11:58</var> CET</small><br><strong>Update</strong> - We have found the cause for the behaviour causing blank pages, and are preparing a fix that should be in place soon.</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>11:12</var> CET</small><br><strong>Investigating</strong> - Customers may be experiencing blanked out content pages within their applications. This behaviour can affect customers on our German as well as international server. <br /><br />Our teams are investigating and will work to resolve this as fast as we can. We will share more information soon.<br /><br />We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.</p>",
				Content:         "",
				Image:           &gofeed.Image{URL: "test.png"},
				Link:            "https://status.staffbase.com/incidents/77004ltfxlkv",
				Links:           []string{"https://status.staffbase.com/incidents/77004ltfxlkv"},
				UpdatedParsed:   nil,
				PublishedParsed: testTimePointer(time.Date(2021, time.December, 23, 9, 30, 37, 0, time.UTC)),
			},
			{
				Title:           "Service disruption with the German media server",
				Description:     "<p><small>Dec <var data-var='date'>20</var>, <var data-var='time'>09:42</var> CET</small><br><strong>Resolved</strong> - This incident has been resolved. We are sorry for the trouble this has caused.\r<br />\r<br />Please contact us at support@staffbase.com should you experience any further issues. We're happy to help!</p><p><small>Dec <var data-var='date'>17</var>, <var data-var='time'>17:14</var> CET</small><br><strong>Monitoring</strong> - We have identified the root cause and the Video Upload should be working again.  <br />We will continue to monitor the systems during the next hours. We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.</p><p><small>Dec <var data-var='date'>17</var>, <var data-var='time'>13:38</var> CET</small><br><strong>Investigating</strong> - We have received reports that some customers may be experiencing long loading times or error while uploading videos.<br />Our teams are investigating and will work to resolve this as fast as we can. We will share more information soon.<br />We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.</p>",
				Content:         "",
				Image:           &gofeed.Image{URL: "test.png"},
				Link:            "https://status.staffbase.com/incidents/p3mdb34gmrx6",
				Links:           []string{"https://status.staffbase.com/incidents/p3mdb34gmrx6"},
				UpdatedParsed:   testTimePointer(time.Date(2021, time.December, 24, 8, 42, 32, 0, time.UTC)),
				PublishedParsed: testTimePointer(time.Date(2021, time.December, 20, 8, 42, 32, 0, time.UTC)),
			},
		},
	},
}

var item1 = Item{
	FeedTitle:   "Staffbase Status - Incident History",
	FeedImage:   "test.png",
	Title:       "Blank content",
	Description: "<p><small>Dec <var data-var='date'>23</var>, <var data-var='time'>10:30</var> CET</small><br><strong>Resolved</strong> - The issue is resolved. We apologize for the inconvenience this has caused. Please get in touch with us at support@staffbase.com in case you still find pages without content. We're happy to help!<br /><br />We wish everyone a nice and relaxing Christmas!!</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>16:16</var> CET</small><br><strong>Update</strong> - We are continuing to monitor for any further issues.</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>12:58</var> CET</small><br><strong>Monitoring</strong> - We have just implemented a fix which gradually should recover all pages. We will continue to monitor the systems until we are sure the issue is fully resolved.</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>11:58</var> CET</small><br><strong>Update</strong> - We have found the cause for the behaviour causing blank pages, and are preparing a fix that should be in place soon.</p><p><small>Dec <var data-var='date'>22</var>, <var data-var='time'>11:12</var> CET</small><br><strong>Investigating</strong> - Customers may be experiencing blanked out content pages within their applications. This behaviour can affect customers on our German as well as international server. <br /><br />Our teams are investigating and will work to resolve this as fast as we can. We will share more information soon.<br /><br />We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.</p>",
	Content:     "",
	Link:        "https://status.staffbase.com/incidents/77004ltfxlkv",
	Links:       []string{"https://status.staffbase.com/incidents/77004ltfxlkv"},
	Updated:     time.Date(2021, time.December, 23, 9, 30, 37, 0, time.UTC).Unix(),
	Published:   time.Date(2021, time.December, 23, 9, 30, 37, 0, time.UTC).Unix(),
	Image:       "test.png",
}

var item2 = Item{
	FeedTitle:   "Staffbase Status - Incident History",
	FeedImage:   "test.png",
	Title:       "Service disruption with the German media server",
	Description: "<p><small>Dec <var data-var='date'>20</var>, <var data-var='time'>09:42</var> CET</small><br><strong>Resolved</strong> - This incident has been resolved. We are sorry for the trouble this has caused.\r<br />\r<br />Please contact us at support@staffbase.com should you experience any further issues. We're happy to help!</p><p><small>Dec <var data-var='date'>17</var>, <var data-var='time'>17:14</var> CET</small><br><strong>Monitoring</strong> - We have identified the root cause and the Video Upload should be working again.  <br />We will continue to monitor the systems during the next hours. We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.</p><p><small>Dec <var data-var='date'>17</var>, <var data-var='time'>13:38</var> CET</small><br><strong>Investigating</strong> - We have received reports that some customers may be experiencing long loading times or error while uploading videos.<br />Our teams are investigating and will work to resolve this as fast as we can. We will share more information soon.<br />We apologize for the inconvenience. If you have any questions regarding this topic, please reach out to our support at support@staffbase.com.</p>",
	Content:     "",
	Link:        "https://status.staffbase.com/incidents/p3mdb34gmrx6",
	Links:       []string{"https://status.staffbase.com/incidents/p3mdb34gmrx6"},
	Updated:     time.Date(2021, time.December, 24, 8, 42, 32, 0, time.UTC).Unix(),
	Published:   time.Date(2021, time.December, 20, 8, 42, 32, 0, time.UTC).Unix(),
	Image:       "test.png",
}

func testTimePointer(t time.Time) *time.Time {
	return &t
}

func TestTransform(t *testing.T) {
	for _, tt := range []struct {
		name          string
		feeds         []*gofeed.Feed
		sortBy        string
		expectedItems []Item
	}{
		{
			name:          "items sort by default",
			feeds:         feeds,
			sortBy:        "",
			expectedItems: []Item{item1, item2},
		},
		{
			name:          "items sort by feed",
			feeds:         feeds,
			sortBy:        "feed",
			expectedItems: []Item{item1, item2},
		},
		{
			name:          "items sort by title",
			feeds:         feeds,
			sortBy:        "title",
			expectedItems: []Item{item1, item2},
		},
		{
			name:          "items sort by updated",
			feeds:         feeds,
			sortBy:        "updated",
			expectedItems: []Item{item2, item1},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			actualItems := Transform(tt.feeds, tt.sortBy)
			require.Equal(t, tt.expectedItems, actualItems)
		})
	}
}
