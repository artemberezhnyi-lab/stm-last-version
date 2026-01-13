from flask import Flask, render_template, request, jsonify
import struct
import webbrowser
import threading
import time
import os
import logging

try:
    import serial
except ImportError:
    serial = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

last_ping_time = time.time()  # Initialize when server starts
ser = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start():
    global ser
    try:
        data = request.get_json()
        
        # Extract global settings
        port = data.get('port')  # Get selected port with COM1 as default
            
        logger.info(f"Using port: {port}")
        
        frequency = data.get('frequency', 0)
        timer_enabled = data.get('timer', {}).get('enabled', False)
        timer_value = data.get('timer', {}).get('value', 0)
        
        # Get active channels
        active_channels = data.get('activeChannels', [])
        channels_data = data.get('channels', {})
        
        logger.info(f"Received request - Port: {port}, Frequency: {frequency}, Timer: {timer_value if timer_enabled else 'disabled'}")
        logger.info(f"Active channels: {active_channels}")
        logger.info(f"Channel data: {channels_data}")
        
        if serial is None:
            logger.error("Serial module not found")
            return jsonify({'error': 'Serial module not found. Please ensure pyserial is installed.'}), 500
            
        if not active_channels:
            logger.error("No active channels specified")
            return jsonify({'error': 'Please enable at least one channel'}), 400
            
        try:
            if ser is None or not ser.is_open:
                # Use the selected port from frontend with explicit settings
                logger.info(f"Attempting to open serial port {port}")
                try:
                    # First try to close any existing connection
                    if ser is not None and ser.is_open:
                        logger.info("Closing existing serial connection")
                        ser.close()
                    
                    # Create new serial connection with explicit settings
                    ser = serial.Serial(
                        port=port,
                        baudrate=115200,  # Increased baud rate
                        bytesize=serial.EIGHTBITS,
                        parity=serial.PARITY_NONE,
                        stopbits=serial.STOPBITS_ONE,
                        timeout=1,
                        write_timeout=1,
                        xonxoff=False,     # disable software flow control
                        rtscts=False,      # disable hardware (RTS/CTS) flow control
                        dsrdtr=False       # disable hardware (DSR/DTR) flow control
                    )
                    
                    if not ser.is_open:
                        ser.open()
                    
                    # Set DTR and RTS lines
                    ser.setDTR(False)  # Changed to False
                    ser.setRTS(False)  # Changed to False
                    
                    logger.info(f"Serial port opened successfully: {ser.name}")
                    logger.info(f"Port settings: {ser.get_settings()}")
                    
                    # Clear buffers
                    ser.reset_input_buffer()
                    ser.reset_output_buffer()
                    
                    time.sleep(0.1)  # Reduced wait time
                    
                    # Try reading any initial data
                    if ser.in_waiting:
                        initial_data = ser.read(ser.in_waiting)
                        logger.info(f"Initial data on port (hex): {[hex(b) for b in initial_data]}")
                        logger.info(f"Initial data on port (ascii): {initial_data}")
                    
                except serial.SerialException as e:
                    logger.error(f"SerialException while opening {port}: {str(e)}")
                    if "PermissionError" in str(e):
                        return jsonify({'error': f'Port {port} is in use by another application. Please close other applications using this port.'}), 500
                    return jsonify({'error': f'Failed to open {port}: {str(e)}'}), 500
                except Exception as e:
                    logger.error(f"Unexpected error opening {port}: {str(e)}")
                    return jsonify({'error': f'Unexpected error opening {port}: {str(e)}'}), 500

            # Verify port is actually open
            if not ser.is_open:
                logger.error(f"Port {port} is not open after connection attempt")
                return jsonify({'error': f'Failed to open {port}. Port is not open after connection attempt.'}), 500
                
            logger.info(f"Port {port} is ready for communication")
            
        except Exception as e:
            logger.error(f"Error during port setup: {str(e)}")
            return jsonify({'error': f'Error during port setup: {str(e)}'}), 500
        
        # Prepare header of the packet
        header = struct.pack('<BIHB',  # Little-endian, no alignment
            0x03,                           # Command byte (uint8_t)
            frequency,                      # freq/period (uint32_t)
            timer_value if timer_enabled else 0,  # delay start timer value in ms (uint16_t)
            len(active_channels)            # channel list count (uint8_t)
        )
        
        logger.info(f"Header bytes: {[hex(b) for b in header]}")
        logger.info(f"Header bytes (ascii): {' '.join([f'{b:02x}' for b in header])}")
        logger.info(f"Delay start timer: {timer_value if timer_enabled else 0}ms")
        logger.info(f"Active channels: {active_channels}")
        
        # Pack data for all active channels
        channels_packed = b''
        for channel_num in active_channels:
            channel_settings = channels_data.get(str(channel_num), {})
            channel_data = struct.pack('<BHHHH',  # Little-endian, no alignment
                channel_num,                   # Channel number (uint8_t)
                channel_settings.get('pulseWidth', 0),  # Pulse width (uint16_t)
                channel_settings.get('offset', 0),      # Offset (uint16_t)
                channel_settings.get('voltage', 0),     # Voltage (uint16_t)
                channel_settings.get('power', 0)        # Power (uint16_t)
            )
            logger.info(f"Channel {channel_num} data (hex): {' '.join([f'{b:02x}' for b in channel_data])}")
            channels_packed += channel_data
        
        # Combine header and channel data and send
        complete_packet = header + channels_packed
        logger.info(f"Complete packet ({len(complete_packet)} bytes) (hex): {' '.join([f'{b:02x}' for b in complete_packet])}")
        
        try:
            # Verify port is still open
            if not ser.is_open:
                logger.error(f"Port {port} closed unexpectedly before writing")
                return jsonify({'error': 'Serial port closed unexpectedly. Please try again.'}), 500

            # Clear any pending data
            ser.reset_input_buffer()
            ser.reset_output_buffer()
            
            # Write data with explicit encoding
            bytes_written = ser.write(complete_packet)
            if bytes_written != len(complete_packet):
                logger.error(f"Failed to write all bytes. Wrote {bytes_written} of {len(complete_packet)} bytes")
                return jsonify({'error': 'Failed to write all data to port'}), 500
                
            ser.flush()  # Ensure all data is written
            logger.info(f"Successfully wrote {bytes_written} bytes to {port}")
            
            # Read any response (if available)
            time.sleep(0.1)  # Give device time to respond
            if ser.in_waiting:
                response = ser.read(ser.in_waiting)
                logger.info(f"Received response (hex): {' '.join([f'{b:02x}' for b in response])}")
                logger.info(f"Received response (ascii): {response}")
            else:
                logger.info("No response received from device")
                
            return jsonify({'status': 'success', 'message': f'PWM Start Command Sent for {len(active_channels)} channels'})
        except serial.SerialTimeoutException:
            logger.error(f"Timeout writing to {port}")
            return jsonify({'error': f'Timeout writing to {port}. Device not responding.'}), 500
        except serial.SerialException as e:
            logger.error(f"Serial error during write: {str(e)}")
            return jsonify({'error': f'Serial communication error: {str(e)}'}), 500
        except Exception as e:
            logger.error(f"Unexpected error during write: {str(e)}")
            return jsonify({'error': f'Unexpected error during write: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stop', methods=['POST'])
def stop():
    global ser
    try:
        if ser and ser.is_open:
            ser.write(struct.pack('<B', 0x04))  # Stop command
            return jsonify({'status': 'success', 'message': 'PWM Stop Command Sent'})
        return jsonify({'error': 'Serial port not open'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ping')
def ping():
    global last_ping_time
    last_ping_time = time.time()
    logger.info(f"Ping received at {time.strftime('%H:%M:%S')}")
    return '', 204

def ping_monitor():
    global last_ping_time
    logger.info("Starting ping monitor...")
    # Add initial delay to allow webpage to load
    time.sleep(20)  # Increased initial delay to 20 seconds
    logger.info("Initial delay completed, starting ping checks...")
    
    consecutive_missed_pings = 0
    MAX_MISSED_PINGS = 3
    
    while True:
        current_time = time.time()
        time_since_last_ping = current_time - last_ping_time
        logger.info(f"Time since last ping: {time_since_last_ping:.1f} seconds")
        
        if time_since_last_ping > 15:  # 15 second timeout
            consecutive_missed_pings += 1
            logger.warning(f"Missed ping #{consecutive_missed_pings}")
            
            if consecutive_missed_pings >= MAX_MISSED_PINGS:
                logger.error("Client disconnected after 3 consecutive missed pings — shutting down.")
                os._exit(0)
        else:
            consecutive_missed_pings = 0
            
        time.sleep(5)

def open_browser():
    try:
        time.sleep(2)  # Increased delay to ensure server is ready
        webbrowser.open("http://127.0.0.1:5000")
    except Exception as e:
        logger.error(f"Error opening browser: {e}")

if __name__ == '__main__':
    try:
        # Set up logging to console for executable
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        logger.info("Starting PWM Generator application...")
        
        # Start browser in a separate thread
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        # Start ping monitor in a separate thread
        ping_thread = threading.Thread(target=ping_monitor, daemon=True)
        ping_thread.start()
        
        # Run Flask with specific host and port
        logger.info("Starting Flask server...")
        app.run(
            host="127.0.0.1",
            port=5000,
            debug=False,
            use_reloader=False,
            threaded=True
        )
    except Exception as e:
        logger.error(f"Error starting application: {e}")
        input("Press Enter to exit...")  # Keep console window open on error