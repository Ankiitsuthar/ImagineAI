import {
    Sparkles, Star, Heart, Zap, Flame, Sun, Moon, Cloud,
    Rocket, Diamond, Crown, Award, Gift, Target, Shield, Globe,
    Palette, Brush, Pen, Pencil, Camera, Image, Film, Music,
    Mic, Headphones, Video, Scissors, Wand2, Layers, Aperture, Lightbulb,
    Briefcase, Building2, TrendingUp, BarChart3, PieChart, DollarSign,
    CreditCard, ShoppingBag, Store, Megaphone, Users, UserCircle,
    Handshake, FileText, ClipboardList, CalendarDays,
    TreePine, Flower2, Leaf, Mountain, Waves, Sunrise, CloudSun,
    Snowflake, Bug, Bird, Fish, Cat, Dog, Rabbit, Squirrel, Cherry,
    Home, Coffee, UtensilsCrossed, Wine, Cake, Dumbbell, Bike,
    Plane, Car, Ship, MapPin, Compass, Tent, Glasses, Shirt, Watch,
    Laptop, Smartphone, Monitor, Cpu, Wifi, Bluetooth, Database,
    Code, Terminal, Gamepad2, Bot, Satellite, Radio, Tv, Printer, HardDrive
} from 'lucide-react';

// Static icon map — only includes icons available in the picker
const ICON_MAP = {
    Sparkles, Star, Heart, Zap, Flame, Sun, Moon, Cloud,
    Rocket, Diamond, Crown, Award, Gift, Target, Shield, Globe,
    Palette, Brush, Pen, Pencil, Camera, Image, Film, Music,
    Mic, Headphones, Video, Scissors, Wand2, Layers, Aperture, Lightbulb,
    Briefcase, Building2, TrendingUp, BarChart3, PieChart, DollarSign,
    CreditCard, ShoppingBag, Store, Megaphone, Users, UserCircle,
    Handshake, FileText, ClipboardList, CalendarDays,
    TreePine, Flower2, Leaf, Mountain, Waves, Sunrise, CloudSun,
    Snowflake, Bug, Bird, Fish, Cat, Dog, Rabbit, Squirrel, Cherry,
    Home, Coffee, UtensilsCrossed, Wine, Cake, Dumbbell, Bike,
    Plane, Car, Ship, MapPin, Compass, Tent, Glasses, Shirt, Watch,
    Laptop, Smartphone, Monitor, Cpu, Wifi, Bluetooth, Database,
    Code, Terminal, Gamepad2, Bot, Satellite, Radio, Tv, Printer, HardDrive
};

/**
 * IconRenderer — renders an icon value that can be:
 *  - lucide icon reference (e.g. "lucide:Camera")
 *  - image data URL or URL (e.g. "data:image/png;base64,..." or "https://...")
 */
const IconRenderer = ({ value, size = 24, className = '' }) => {
    if (!value) return null;

    // Lucide icon
    if (value.startsWith('lucide:')) {
        const iconName = value.replace('lucide:', '');
        const LucideIcon = ICON_MAP[iconName];
        if (LucideIcon) {
            return <LucideIcon size={size} className={className} />;
        }
        return <Sparkles size={size} className={className} />;
    }

    // Image (data URL or http URL)
    if (value.startsWith('data:image/') || value.startsWith('http')) {
        return (
            <img
                src={value}
                alt="icon"
                className={`icon-renderer-img ${className}`}
                style={{ width: size, height: size, objectFit: 'cover', borderRadius: '4px' }}
            />
        );
    }

    // Emoji / plain text fallback
    return <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>{value}</span>;
};

export default IconRenderer;
