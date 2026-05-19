import os
import zipfile

def create_apk(filename, manifest_content, java_content):
    # Ensure directory exists
    os.makedirs("test_apks", exist_ok=True)
    apk_path = os.path.join("test_apks", filename)
    
    # Create a zip archive (which is the basis of an APK file structure)
    with zipfile.ZipFile(apk_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Write AndroidManifest.xml at the root
        zip_file.writestr("AndroidManifest.xml", manifest_content)
        # Write MainActivity.java at the root
        zip_file.writestr("MainActivity.java", java_content)
        
    print(f"Created mock APK: {apk_path} (size: {os.path.getsize(apk_path)} bytes)")

# 1. Secure App (Good Score)
secure_manifest = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.secure.app">
    <application android:usesCleartextTraffic="false">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""

secure_java = """package com.secure.app;

public class MainActivity {
    // All endpoints are encrypted with TLS/SSL (HTTPS)
    private static final String API_ENDPOINT = "https://api.secure-endpoint.com/v2/data";
    private static final String AUTH_ENDPOINT = "https://auth.secure-endpoint.com/v1/token";
    private static final String STATIC_CDN = "https://cdn.secure-endpoint.com/assets/logo.png";
}
"""

# 2. Vulnerable App (Bad Score)
vulnerable_manifest = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.vulnerable.app">
    <!-- Permit unencrypted traffic -->
    <application android:usesCleartextTraffic="true">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""

vulnerable_java = """package com.vulnerable.app;

public class MainActivity {
    // Unencrypted HTTP and raw IP connections
    private static final String DEV_API = "http://insecure-api.com/v1/users";
    private static final String DEBUG_SERVER = "http://192.168.1.105:8080/debug";
    private static final String LEGACY_FEED = "http://legacy.vulnerable.app/news.json";
}
"""

if __name__ == "__main__":
    create_apk("SecureApp.apk", secure_manifest, secure_java)
    create_apk("VulnerableApp.apk", vulnerable_manifest, vulnerable_java)
