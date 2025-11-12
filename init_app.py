import os
import sys
from app import app, db, init_db

def initialize_application():
    """Initialize the application with proper setup"""
    print("Initializing Photo Gallery Application...")
    
    with app.app_context():
        # Create all necessary directories
        directories = [
            'instance',
            app.config['UPLOAD_FOLDER'],
            'static/uploads',
            'templates/includes'
        ]
        
        for directory in directories:
            try:
                os.makedirs(directory, exist_ok=True)
                print(f"✅ Created/Verified directory: {directory}")
            except Exception as e:
                print(f"❌ Error creating directory {directory}: {e}")
        
        # Initialize database
        print("📊 Initializing database...")
        init_db()
        
        # Verify upload folder
        upload_folder = app.config['UPLOAD_FOLDER']
        print(f"📁 Upload folder: {upload_folder}")
        print(f"📁 Upload folder exists: {os.path.exists(upload_folder)}")
        print(f"📁 Upload folder writable: {os.access(upload_folder, os.W_OK)}")
        
        # Test file creation
        test_file = os.path.join(upload_folder, 'test.txt')
        try:
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            print("✅ Upload folder is writable")
        except Exception as e:
            print(f"❌ Upload folder not writable: {e}")
        
        print("🎉 Application initialized successfully!")

if __name__ == '__main__':
    initialize_application()