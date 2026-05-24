# 🚀 Quick Start Guide - Homepage System

## ✅ What's Done

Your homepage system is **100% complete**! All code is written and ready to use.

---

## 🎯 3 Steps to Go Live

### **Step 1: Run Migration** (5 minutes)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire content of:
   ```
   supabase/migrations/015_homepage_system_rebuild.sql
   ```
5. Click **Run**
6. You should see: "Success. No rows returned"

**Verify it worked**:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'homepage_config';
```
You should see: `editorial_banner`, `stats_strip`, `newsletter`, `video_section`, `collections_row`, `new_arrivals`

---

### **Step 2: Test Admin Panel** (10 minutes)

1. Go to your admin panel: `/admin/homepage`
2. You'll see 8 tabs at the top
3. Click **"Stats Strip"** tab
4. Click **"ADD STAT"** button
5. Fill in:
   - Value: `2000+`
   - Label: `PIECES SOLD`
6. Click **"SAVE"** button
7. You should see: "stats_strip updated!" toast

---

### **Step 3: Verify Real-Time** (5 minutes)

1. Open your homepage in a **new tab**: `/`
2. Keep the admin panel open in another tab
3. In admin panel, go to **"Stats Strip"**
4. Change a stat value
5. Click **"SAVE"**
6. **Switch to homepage tab**
7. **The stat should update INSTANTLY** (no refresh needed!)

If it updates instantly → **SUCCESS!** 🎉

---

## 🎨 What You Can Edit Now

### **1. Hero Slides** (`/admin/homepage` → Hero Slides tab)
- Add/edit/delete carousel slides
- Upload images
- Set headlines and CTAs
- Configure slideshow speed

### **2. Announcement Bar** (Announcement tab)
- Add rotating messages
- Change colors

### **3. Stats Strip** (Stats tab)
- Add up to 4 stats
- Set values and labels

### **4. Editorial Banner** (Editorial Banner tab)
- Upload image
- Set headline and description
- Set CTA button

### **5. New Arrivals** (New Arrivals tab)
- Toggle auto/manual mode
- Select specific products (manual mode)

### **6. Collections Row** (Collections Row tab)
- Toggle auto/manual mode
- Select specific collections (manual mode)

### **7. Video Section** (Video tab)
- Set video URL
- Upload thumbnail
- Set overlay text

### **8. Newsletter** (Newsletter tab)
- Set headline and description
- Customize placeholder text

---

## 🔧 Troubleshooting

### **Problem: Admin panel shows "Loading..."**
**Solution**: Run the migration (Step 1)

### **Problem: Changes don't appear on frontend**
**Solution**: 
1. Check browser console for errors (F12)
2. Verify realtime is enabled in Supabase
3. Try refreshing the page manually

### **Problem: "Error saving section"**
**Solution**:
1. Check Supabase logs
2. Verify you're logged in as admin
3. Check database permissions

### **Problem: Images not uploading**
**Solution**:
1. Check storage bucket is configured
2. Verify storage policies allow uploads
3. Try using a direct URL instead

---

## 📖 Documentation

- **Complete Guide**: `HOMEPAGE_SYSTEM_COMPLETE_FINAL.md`
- **Technical Details**: `HOMEPAGE_SYSTEM_REBUILD_PLAN.md`
- **Implementation**: `HOMEPAGE_REBUILD_COMPLETE.md`

---

## 🎉 You're Done!

After completing the 3 steps above, your homepage system is **fully operational**!

**Key Features**:
- ✅ Edit all homepage sections from admin panel
- ✅ Changes appear instantly on frontend (no refresh)
- ✅ Toggle sections on/off
- ✅ Upload images via media library
- ✅ Select products/collections manually
- ✅ No hardcoded content

**Enjoy your new dynamic homepage system!** 🚀
