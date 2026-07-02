package utils

import (
	"fmt"
	"time"
)

func GetDuration(Time time.Time) string {
	duration := time.Since(Time)
	switch {
	case duration.Minutes() < 1:
		return "Now"
	case duration.Minutes() < 60:
		return fmt.Sprintf("%d Minute ago", int(duration.Minutes()))
	case duration.Hours() < 24:
		return fmt.Sprintf("%d Hour ago", int(duration.Hours()))
	default:
		return fmt.Sprintf("%d Day ago", int(duration.Hours()/24))
	}
}
