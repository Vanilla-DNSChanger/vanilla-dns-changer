declare module 'network' {
  interface NetworkInterface {
    name: string;
    mac_address: string | undefined;
    ip_address: string | undefined;
    vendor: string;
    model: string;
    type: string;
    netmask: string | null;
    gateway_ip: string | null;
  }

  interface NetworkInfo {
    ip_address: string;
    mac_address: string;
    gateway_ip: string;
    interface: string;
  }

  export function get_interfaces_list(
    callback: (err: Error | null, interfaces: NetworkInterface[]) => void
  ): void;

  export function get_active_interface(
    callback: (err: Error | null, info: NetworkInfo | null) => void
  ): void;

  export function get_public_ip(
    callback: (err: Error | null, ip: string) => void
  ): void;

  export function get_private_ip(
    callback: (err: Error | null, ip: string) => void
  ): void;

  export function get_gateway_ip(
    callback: (err: Error | null, ip: string) => void
  ): void;
}
