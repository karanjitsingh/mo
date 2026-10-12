package cmd

import "testing"

func TestIsPrivateNetworkAddr(t *testing.T) {
	tests := []struct {
		name       string
		remoteAddr string
		want       bool
	}{
		{"loopback v4", "127.0.0.1:54321", true},
		{"loopback v6", "[::1]:54321", true},
		{"tailscale v4", "100.64.1.2:54321", true},
		{"tailscale v6", "[fd7a:115c:a1e0::1]:54321", true},
		{"lan 10/8", "10.1.2.3:54321", true},
		{"lan 172.16/12", "172.20.0.5:54321", true},
		{"lan 192.168/16", "192.168.1.5:54321", true},
		{"link-local v6", "[fe80::1%eth0]:54321", true},
		{"public v4", "8.8.8.8:54321", false},
		{"public v6", "[2001:4860:4860::8888]:54321", false},
		{"no port", "192.168.1.5", true},
		{"garbage", "not-an-ip:54321", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isPrivateNetworkAddr(tt.remoteAddr); got != tt.want {
				t.Errorf("isPrivateNetworkAddr(%q) = %v, want %v", tt.remoteAddr, got, tt.want)
			}
		})
	}
}
