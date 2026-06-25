# Router X100 — User Manual

## Factory reset

To restore factory defaults:

1. Locate the **reset** pinhole on the back of the router, next to the WAN port.
2. Use a paperclip to press and hold the button for **10 seconds** while the router is powered on.
3. Release. All LEDs will flash twice and the router will reboot (about 90 seconds).
4. Default SSID is `RouterX100-XXXX` (last 4 of the MAC). Default password is on the bottom sticker.

## LED status reference

| LED | State | Meaning |
|---|---|---|
| Power | Solid green | Normal operation |
| Power | Blinking red | Firmware corrupted — try a factory reset; if persistent, RMA |
| Internet | Solid green | WAN link up, DHCP lease acquired |
| Internet | Blinking amber | WAN link up, no DHCP — check upstream modem |
| Internet | Off | No WAN cable detected |
| Wi-Fi | Solid blue | 2.4GHz + 5GHz both broadcasting |
| Wi-Fi | Solid white | Only 2.4GHz broadcasting (5GHz disabled) |

## Blinking red Power LED — troubleshooting

If the Power LED keeps blinking red after a factory reset:

1. Unplug for 30 seconds, then plug back in.
2. Try a TFTP firmware recovery: hold reset while powering on, then push the latest `.bin` to `192.168.1.1` from a wired client.
3. If still blinking red after recovery attempt, the flash chip is likely failed. Initiate an RMA via support.
