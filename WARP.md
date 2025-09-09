# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Vivah Villa Collection** is a static website for a premium wedding attire rental business in Rajkot, Gujarat. The site showcases collections of traditional Indian wedding wear including sherwanis, lehengas, suits, jodhpuris, and cholis.

## Architecture & Structure

### Core Technologies
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid, Flexbox, and CSS Custom Properties
- **Animations**: Custom intersection observer-based animation system
- **No Framework**: Pure vanilla JavaScript implementation

### File Structure
```
vvc/
├── index.html              # Main landing page
├── index1.html             # Alternative/backup version
├── styles.css              # Main stylesheet with CSS custom properties
├── animations.js           # Animation system and interactive features
├── collections.json        # Product data for dynamic collection loading
├── img/                    # Image assets organized by type
│   ├── collections/        # Product images
│   ├── gallery/           # Gallery images (Male/Female folders)
│   └── logo/              # Brand assets
├── .vscode/               # VS Code configuration
└── SEO files              # robots.txt, sitemap.xml, Google verification
```

### Key Features
1. **Responsive Design**: Mobile-first approach with extensive media queries
2. **Dynamic Collections**: JSON-driven product showcase with filtering
3. **Performance Optimized**: Intersection Observer for animations, lazy loading considerations
4. **SEO Optimized**: Structured data, meta tags, semantic HTML
5. **Accessibility**: ARIA labels, semantic markup, keyboard navigation

## Development Commands

### Local Development
```powershell
# Serve the website locally (Python method)
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Or using PHP (if available)
php -S localhost:8000
```

### File Operations
```powershell
# View file structure
Get-ChildItem -Recurse -Name

# Check image assets
Get-ChildItem img -Recurse -Name

# Search for specific content
Select-String -Pattern "pattern" -Path "*.html","*.css","*.js"
```

### Image Management
```powershell
# List all collection images
Get-ChildItem img\collections\

# List gallery images
Get-ChildItem img\gallery\ -Recurse
```

## Code Architecture Patterns

### CSS Architecture
- **CSS Custom Properties**: Extensive use of `:root` variables for theming
- **Component-based**: Each UI component has its own CSS section
- **Responsive Design**: Mobile-first with progressive enhancement
- **Performance**: Optimized selectors and minimal reflow triggers

### JavaScript Architecture
- **Module Pattern**: IIFE (Immediately Invoked Function Expression) for encapsulation
- **Event Delegation**: Efficient event handling for dynamic content
- **Intersection Observer**: Modern scroll-based animations
- **Fallback Support**: Graceful degradation for older browsers

### Data Management
- **JSON-driven Collections**: Product data stored in `collections.json`
- **Fallback Data**: Embedded fallback data in HTML for offline functionality
- **Schema.org Integration**: Structured data for SEO

## Content Management

### Adding New Collections
1. **Add images** to `img/collections/` following naming convention: `{gender}-{type}-{number}.jpg`
2. **Update collections.json** with new item data:
```json
{
  "tags": ["gender", "type"],
  "img": "img/collections/filename.jpg",
  "alt": "Descriptive alt text",
  "title": "Product Title",
  "desc": "Short description • Features",
  "price": "₹XXXX/-"
}
```
3. **Test filtering** functionality to ensure new tags work correctly

### Gallery Management
- **Male gallery**: Store in `img/gallery/Male/`
- **Female gallery**: Store in `img/gallery/Female/`
- **Naming**: Use sequential numbering (1.jpg, 2.jpg, etc.)

## Performance Considerations

### Image Optimization
- **Format**: JPG for photos, PNG for logos with transparency
- **Sizing**: Optimize for web delivery (compress but maintain quality)
- **Loading**: Lazy loading implemented for gallery images

### Animation Performance
- **Intersection Observer**: Used instead of scroll events for better performance
- **Reduced Motion**: Respects user's motion preferences
- **Hardware Acceleration**: CSS transforms used for smooth animations

### Caching Strategy
- **Static Assets**: All assets are cacheable
- **Versioning**: Consider adding version parameters for cache busting when needed

## Browser Support

### Modern Features Used
- CSS Grid and Flexbox
- CSS Custom Properties
- Intersection Observer API
- ES6+ JavaScript features

### Fallbacks Implemented
- Smooth scroll polyfill for older browsers
- Fallback animation system for browsers without Intersection Observer
- Progressive enhancement approach

## Business Logic

### Contact Integration
- **WhatsApp**: Deep linking with pre-filled messages
- **Phone**: Direct tel: links for mobile users
- **Email**: Standard mailto: links
- **Form Handling**: Front-end validation (requires backend integration for submission)

### Pricing Structure
- **Men's Wear**: ₹1999-₹9999 range
- **Women's Wear**: ₹5999-₹19999 range
- **Daily rental**: All prices are per-day rates

## SEO & Marketing

### Structured Data
- Business information with Schema.org markup
- Product catalog integration
- Local business optimization for Rajkot location

### Social Media Integration
- Open Graph meta tags
- Social media links (Instagram, Facebook, WhatsApp)
- Shareable content structure

## Common Modifications

### Updating Contact Information
- **Phone numbers**: Search and replace across HTML files
- **WhatsApp links**: Update in both navigation and contact sections
- **Address**: Update in contact section and structured data

### Theme Customization
- **Colors**: Modify CSS custom properties in `:root`
- **Fonts**: Update Google Fonts links and font family variables
- **Spacing**: Adjust spacing variables for consistent design

### Adding New Sections
- Follow existing HTML structure with semantic elements
- Add corresponding CSS in appropriate section
- Include animation attributes (`data-anim`) for consistency
- Update navigation if needed

## Testing Checklist

### Functionality Testing
- [ ] Mobile menu toggle works
- [ ] Collection filtering functions correctly
- [ ] Contact links (phone, WhatsApp, email) work
- [ ] Form validation responds appropriately
- [ ] Smooth scrolling navigation works

### Performance Testing
- [ ] Images load correctly with fallbacks
- [ ] Animations trigger appropriately
- [ ] Page loads within acceptable time
- [ ] No console errors

### Responsive Testing
- [ ] Mobile devices (320px+)
- [ ] Tablets (768px+)
- [ ] Desktop (1024px+)
- [ ] Large screens (1280px+)

### SEO Testing
- [ ] Meta tags are complete
- [ ] Structured data validates
- [ ] Images have proper alt text
- [ ] Links have appropriate titles/aria-labels
