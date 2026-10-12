package cmd

import (
	"net"
	"net/http"
	"strings"
)

// privateNetworks are the address ranges considered safe to serve to without
// --dangerously-allow-remote-access: loopback, RFC1918/link-local private LAN
// ranges, and Tailscale's CGNAT (IPv4) and ULA (IPv6) ranges.
var privateNetworks = mustParseCIDRs(
	"127.0.0.0/8",
	"::1/128",
	"100.64.0.0/10",       // Tailscale IPv4 (CGNAT range)
	"fd7a:115c:a1e0::/48", // Tailscale IPv6 (ULA range)
	"10.0.0.0/8",
	"172.16.0.0/12",
	"192.168.0.0/16",
	"fe80::/10", // link-local
)

func mustParseCIDRs(cidrs ...string) []*net.IPNet {
	nets := make([]*net.IPNet, 0, len(cidrs))
	for _, c := range cidrs {
		_, n, err := net.ParseCIDR(c)
		if err != nil {
			panic("cmd: invalid CIDR " + c + ": " + err.Error())
		}
		nets = append(nets, n)
	}
	return nets
}

// isPrivateNetworkAddr reports whether remoteAddr (a "host:port", as found in
// http.Request.RemoteAddr) belongs to privateNetworks.
func isPrivateNetworkAddr(remoteAddr string) bool {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		host = remoteAddr
	}
	// Strip IPv6 zone id, e.g. "fe80::1%eth0".
	if i := strings.Index(host, "%"); i != -1 {
		host = host[:i]
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return false
	}
	for _, n := range privateNetworks {
		if n.Contains(ip) {
			return true
		}
	}
	return false
}

// restrictToPrivateNetworks wraps next so that requests from outside
// privateNetworks are rejected with 403, instead of being served. Used when
// binding to a non-loopback address without --dangerously-allow-remote-access.
func restrictToPrivateNetworks(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isPrivateNetworkAddr(r.RemoteAddr) {
			http.Error(w,
				"Forbidden: mo only accepts connections from localhost, private LAN, and Tailscale networks. Use --dangerously-allow-remote-access to allow other clients.",
				http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
