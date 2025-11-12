import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, TextAreaField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Optional
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.utils import secure_filename
from PIL import Image
import datetime

# Initialize Flask app first
app = Flask(__name__)
app.config.from_object('config.Config')

# Now initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.Text, nullable=True)
    date_uploaded = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_favorite = db.Column(db.Boolean, default=False)
    uploaded_by = db.Column(db.String(80), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Forms
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = StringField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class PhotoForm(FlaskForm):
    image = FileField('Photo', validators=[
        FileRequired(),
        FileAllowed(['jpg', 'jpeg', 'png', 'gif', 'webp'], 'Images only!')
    ])
    caption = TextAreaField('Caption', validators=[Optional()])
    submit = SubmitField('Upload Photo')

class EditPhotoForm(FlaskForm):
    caption = TextAreaField('Caption', validators=[Optional()])
    is_favorite = BooleanField('Mark as Favorite')
    submit = SubmitField('Update Photo')

# Utility functions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def resize_image(image_path, max_size=(1200, 1200)):
    try:
        print(f"Resizing image: {image_path}")
        with Image.open(image_path) as img:
            print(f"Original size: {img.size}")
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(image_path, optimize=True, quality=85)
            print(f"Resized to: {img.size}")
    except Exception as e:
        print(f"Error resizing image {image_path}: {e}")

# Routes
@app.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    photos = Photo.query.order_by(Photo.date_uploaded.desc()).paginate(
        page=page, per_page=12, error_out=False)
    return render_template('index.html', photos=photos)

@app.route('/favorites')
def favorites():
    photos = Photo.query.filter_by(is_favorite=True).order_by(Photo.date_uploaded.desc()).all()
    return render_template('favorites.html', photos=photos)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    if query:
        photos = Photo.query.filter(
            (Photo.caption.contains(query))
        ).order_by(Photo.date_uploaded.desc()).all()
    else:
        photos = []
    return render_template('index.html', photos=photos, search_query=query)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Invalid username or password', 'error')
    return render_template('login.html', form=form)

@app.route('/secret-access')
def secret_access():
    """Secret access page that redirects to login"""
    return redirect(url_for('login'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin():
    photos = Photo.query.order_by(Photo.date_uploaded.desc()).all()
    stats = {
        'total_photos': len(photos),
        'favorites': Photo.query.filter_by(is_favorite=True).count(),
        'recent_uploads': Photo.query.filter(
            Photo.date_uploaded >= datetime.datetime.utcnow() - datetime.timedelta(days=7)
        ).count()
    }
    return render_template('admin.html', photos=photos, stats=stats)

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    form = PhotoForm()
    if form.validate_on_submit():
        file = form.image.data
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid filename conflicts
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            filename = f"{timestamp}_{filename}"
            
            # Get absolute upload path
            upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
            
            # Ensure upload directory exists
            try:
                os.makedirs(upload_folder, exist_ok=True)
                print(f"Upload directory ensured: {upload_folder}")
            except Exception as e:
                flash(f'Error creating upload directory: {str(e)}', 'error')
                return render_template('upload.html', form=form)
            
            filepath = os.path.join(upload_folder, filename)
            
            try:
                # Save the file
                file.save(filepath)
                print(f"File saved successfully to: {filepath}")
                print(f"File size: {os.path.getsize(filepath)} bytes")
                print(f"File exists: {os.path.exists(filepath)}")
                
                # Resize image for optimization
                try:
                    resize_image(filepath)
                    print("Image resized successfully")
                except Exception as resize_error:
                    print(f"Resize warning: {resize_error}")
                    # Continue even if resize fails
                
                # Create database record
                photo = Photo(
                    filename=filename,
                    caption=form.caption.data,
                    uploaded_by=current_user.username
                )
                db.session.add(photo)
                db.session.commit()
                print(f"Database record created with ID: {photo.id}")
                
                flash('Photo uploaded successfully!', 'success')
                return redirect(url_for('admin'))
                
            except Exception as e:
                db.session.rollback()
                flash(f'Error uploading photo: {str(e)}', 'error')
                print(f"Upload error: {e}")
        else:
            flash('Invalid file type. Please upload an image (PNG, JPG, JPEG, GIF, WEBP).', 'error')
    
    return render_template('upload.html', form=form)

@app.route('/debug/files')
@login_required
def debug_files():
    """Debug route to check file status"""
    photos = Photo.query.all()
    file_status = []
    
    upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
    
    for photo in photos:
        filepath = os.path.join(upload_folder, photo.filename)
        exists = os.path.exists(filepath)
        file_status.append({
            'id': photo.id,
            'filename': photo.filename,
            'db_exists': True,
            'file_exists': exists,
            'filepath': filepath,
            'url': url_for('uploaded_file', filename=photo.filename, _external=True),
            'file_size': os.path.getsize(filepath) if exists else 0
        })
    
    return jsonify({
        'upload_folder': upload_folder,
        'upload_folder_exists': os.path.exists(upload_folder),
        'photos_count': len(photos),
        'files_exist': sum(1 for p in file_status if p['file_exists']),
        'files': file_status
    })

@app.route('/edit/<int:photo_id>', methods=['GET', 'POST'])
@login_required
def edit_photo(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    form = EditPhotoForm(obj=photo)
    
    if form.validate_on_submit():
        photo.caption = form.caption.data
        photo.is_favorite = form.is_favorite.data
        db.session.commit()
        flash('Photo updated successfully!', 'success')
        return redirect(url_for('admin'))
    
    return render_template('edit_photo.html', form=form, photo=photo)

@app.route('/delete/<int:photo_id>', methods=['POST'])
@login_required
def delete_photo(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    
    # Delete file from filesystem
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], photo.filename)
        if os.path.exists(filepath):
            os.remove(filepath)
    except OSError as e:
        print(f"Error deleting file: {e}")
    
    db.session.delete(photo)
    db.session.commit()
    flash('Photo deleted successfully!', 'success')
    return redirect(url_for('admin'))

@app.route('/toggle_favorite/<int:photo_id>', methods=['POST'])
def toggle_favorite(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    photo.is_favorite = not photo.is_favorite
    db.session.commit()
    return jsonify({'is_favorite': photo.is_favorite})

@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
    filepath = os.path.join(upload_folder, filename)
    
    print(f"Requested file: {filename}")
    print(f"Looking in: {upload_folder}")
    print(f"Full path: {filepath}")
    print(f"File exists: {os.path.exists(filepath)}")
    
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        # Return a 404 instead of crashing
        return "File not found", 404
    
    return send_from_directory(upload_folder, filename)

# API Routes
@app.route('/api/photos')
def api_photos():
    """API endpoint for photos (for AJAX loading)"""
    photos = Photo.query.order_by(Photo.date_uploaded.desc()).all()
    photos_data = []
    for photo in photos:
        photos_data.append({
            'id': photo.id,
            'filename': photo.filename,
            'caption': photo.caption,
            'date_uploaded': photo.date_uploaded.isoformat(),
            'is_favorite': photo.is_favorite,
            'url': url_for('uploaded_file', filename=photo.filename)
        })
    return jsonify(photos_data)

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# Initialize database and create admin user
def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create admin user if not exists
        if not User.query.filter_by(username='admin').first():
            admin_user = User(username='admin')
            admin_user.set_password('admin123')  # Change this in production!
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created: username='admin', password='admin123'")
        
        # Add sample data if no photos exist
        if Photo.query.count() == 0:
            add_sample_data()

def add_sample_data():
    """Add sample photos for demonstration"""
    sample_photos = [
        Photo(
            filename='sample1.jpg',
            caption='Our first adventure together 🌟',
            uploaded_by='admin',
            is_favorite=True
        ),
        Photo(
            filename='sample2.jpg',
            caption='Sunset walks and endless talks 🌅',
            uploaded_by='admin',
            is_favorite=False
        ),
    ]
    for photo in sample_photos:
        db.session.add(photo)
    db.session.commit()
    print("Sample photos added!")

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs('instance', exist_ok=True)
    
    # Initialize database
    init_db()
    
    # Run the application
    app.run(debug=True)