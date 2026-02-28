## GitHub Copilot Chat

- Extension: 0.37.9 (prod)
- VS Code: 1.109.5 (072586267e68ece9a47aa43f8c108e0dcbf44622)
- OS: win32 10.0.26200 x64
- Remote Name: ssh-remote
- Extension Kind: UI
- GitHub Account: systemnextit-spec

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.205.243.168 (6 ms)
- DNS ipv6 Lookup: Error (32 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): HTTP 200 (64 ms)
- Node.js https: HTTP 200 (219 ms)
- Node.js fetch: HTTP 200 (333 ms)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (36 ms)
- DNS ipv6 Lookup: Error (41 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (12 ms)
- Electron fetch (configured): HTTP 200 (874 ms)
- Node.js https: HTTP 200 (899 ms)
- Node.js fetch: HTTP 200 (812 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 20.250.119.64 (70 ms)
- DNS ipv6 Lookup: Error (44 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (2 ms)
- Electron fetch (configured): HTTP 200 (621 ms)
- Node.js https: HTTP 200 (597 ms)
- Node.js fetch: HTTP 200 (614 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (1023 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (902 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (808 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (805 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (191 ms)

Number of system certificates: 72

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).