import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Building2, MapPin, Layers, Camera, User, CheckCircle2, ArrowRight, Upload, X, AlertCircle } from 'lucide-react';
import { PropertyType, AreaUnit, User as UserType } from '../types';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';

interface PostPropertyPageProps {
  currentUser: UserType | null;
  onOpenAuth: (defaultRole?: 'buyer' | 'seller') => void;
  onPropertyCreated?: () => void;
}

export const PostPropertyPage: React.FC<PostPropertyPageProps> = ({
  currentUser,
  onOpenAuth,
  onPropertyCreated
}) => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('Sq Ft');

  // Location
  const [state, setState] = useState('Uttar Pradesh');
  const [city, setCity] = useState('Agra');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');

  // Dynamic Specs
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [floors, setFloors] = useState('2');
  const [floorNumber, setFloorNumber] = useState('4');
  const [totalFloors, setTotalFloors] = useState('12');
  const [parking, setParking] = useState('1 Covered Car Parking');
  const [facing, setFacing] = useState('East');
  const [roadWidth, setRoadWidth] = useState('30 Feet');
  const [plotDimensions, setPlotDimensions] = useState('30 x 50 Ft');
  const [boundaryStatus, setBoundaryStatus] = useState('Completed');
  const [landType, setLandType] = useState('Agricultural');
  const [societyName, setSocietyName] = useState('');

  // Media State
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [videoUrl, setVideoUrl] = useState('');

  // Seller Details
  const [sellerName, setSellerName] = useState(currentUser?.name || '');
  const [sellerMobile, setSellerMobile] = useState(currentUser?.mobile || '');
  const [sellerWhatsapp, setSellerWhatsapp] = useState(currentUser?.mobile || '');
  const [sellerType, setSellerType] = useState<'Owner' | 'Dealer' | 'Builder'>('Owner');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('seller');
      return;
    }

    if (!title || !price || !area || !city || !locality || !address || !sellerName || !sellerMobile) {
      setError('Please fill all mandatory fields (Title, Price, Area, City, Locality, Address, Seller Name & Mobile).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const specifications: any = {};
      if (propertyType === 'House') {
        specifications.bedrooms = Number(bedrooms);
        specifications.bathrooms = Number(bathrooms);
        specifications.floors = Number(floors);
        specifications.parking = parking;
        specifications.facing = facing;
      } else if (propertyType === 'Flat') {
        specifications.bedrooms = Number(bedrooms);
        specifications.bathrooms = Number(bathrooms);
        specifications.floor_number = Number(floorNumber);
        specifications.total_floors = Number(totalFloors);
        specifications.society_name = societyName;
        specifications.parking = parking;
      } else if (propertyType === 'Plot') {
        specifications.plot_dimensions = plotDimensions;
        specifications.facing = facing;
        specifications.road_width = roadWidth;
        specifications.boundary_status = boundaryStatus;
      } else if (propertyType === 'Land') {
        specifications.land_type = landType;
        specifications.road_access = true;
        specifications.water_availability = true;
        specifications.electricity_availability = true;
      }

      const mediaPayload = photoUrls.map((url, i) => ({
        id: `media_${i + 1}`,
        media_type: 'photo' as const,
        media_url: url,
        is_cover: i === 0
      }));

      if (videoUrl.trim()) {
        mediaPayload.push({
          id: `media_video_1`,
          media_type: 'video' as const,
          media_url: videoUrl.trim(),
          is_cover: false
        });
      }

      const res = await api.postProperty({
        title,
        property_type: propertyType,
        price: Number(price),
        area: Number(area),
        area_unit: areaUnit,
        state,
        city,
        locality,
        address,
        landmark,
        pincode,
        seller_name: sellerName,
        seller_mobile: sellerMobile,
        seller_whatsapp: sellerWhatsapp || sellerMobile,
        seller_type: sellerType,
        description: description || `${propertyType} available for immediate sale in ${locality}, ${city}. Excellent location with clear title documents.`,
        specifications,
        media_urls: mediaPayload
      });

      if (res.success) {
        setSuccessData(res.property);
        if (onPropertyCreated) onPropertyCreated();
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Property Submitted Successfully!</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Your property <strong>"{successData.title}"</strong> is now live for sale on ApnaProperty. Buyers can browse it immediately, and your contact info remains protected until unlocked.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(`/property/${successData.slug || successData.id}`)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition"
          >
            View Live Listing
          </button>
          <button
            onClick={() => navigate('/my-properties')}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl text-sm transition"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <span>Free Property Listing</span>
          <span className="w-1 h-1 rounded-full bg-emerald-600" />
          <span>Sale Only</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          List Your Property For Sale
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide accurate property details and photos. Your contact details remain securely protected until unlocked by serious buyers.
        </p>
      </div>

      {!currentUser && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You need an account to post. You can sign in or create a free seller account in 10 seconds.</span>
          </div>
          <button
            onClick={() => onOpenAuth('seller')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Photos & Video Upload (At Starting of Form) */}
        <MediaUploader
          photoUrls={photoUrls}
          onChangePhotos={setPhotoUrls}
          videoUrl={videoUrl}
          onChangeVideo={setVideoUrl}
        />

        {/* Step 2: Basic Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Basic Property Information</h2>
              <p className="text-xs text-slate-500">Essential public information seen by buyers</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3 BHK Luxury Independent Kothi / House for Urgent Sale"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                >
                  <option value="House">House / Villa / Kothi</option>
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Plot">Residential Plot</option>
                  <option value="Land">Agricultural Land</option>
                  <option value="Shop">Commercial Shop</option>
                  <option value="Office">Office Space</option>
                  <option value="Other">Other Property</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Selling Price (in ₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 6500000 (65 Lakh)"
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Area & Unit <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 1800"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                    className="w-28 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 shrink-0"
                  >
                    <option value="Sq Ft">Sq Ft</option>
                    <option value="Sq Yard">Sq Yard</option>
                    <option value="Sq Meter">Sq Meter</option>
                    <option value="Bigha">Bigha</option>
                    <option value="Acre">Acre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Location Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Location & Complete Address</h2>
              <p className="text-xs text-slate-500">Locality & City are public; Full street address is unlocked only for ₹50</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Agra"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Locality / Area (Public) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Dayalbagh / Kamla Nagar"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 282005"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Complete Exact Property Address (Protected until ₹50 unlock) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot No 42, Green Avenue Colony, Near Dayalbagh Temple, Agra"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prominent Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Radhasoami Satsang Hall"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Dynamic Property Specifications */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Property Specifications ({propertyType})</h2>
              <p className="text-xs text-slate-500">Customized fields for {propertyType}</p>
            </div>
          </div>

          {(propertyType === 'House' || propertyType === 'Flat') && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms (BHK)</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facing</label>
                <select
                  value={facing}
                  onChange={(e) => setFacing(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="East">East Facing (Vaastu Compliant)</option>
                  <option value="North">North Facing</option>
                  <option value="North-East">North-East Facing</option>
                  <option value="West">West Facing</option>
                  <option value="South">South Facing</option>
                </select>
              </div>

              {propertyType === 'House' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Floors</label>
                  <input
                    type="number"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              )}

              {propertyType === 'Flat' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Floor Number</label>
                    <input
                      type="number"
                      value={floorNumber}
                      onChange={(e) => setFloorNumber(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Society Name</label>
                    <input
                      type="text"
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      placeholder="e.g. ATS Greens / Jaypee Greens"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parking</label>
                <input
                  type="text"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  placeholder="e.g. 1 Covered Car + 2 Bikes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          )}

          {propertyType === 'Plot' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plot Dimensions</label>
                <input
                  type="text"
                  value={plotDimensions}
                  onChange={(e) => setPlotDimensions(e.target.value)}
                  placeholder="e.g. 30 x 50 Feet"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facing</label>
                <input
                  type="text"
                  value={facing}
                  onChange={(e) => setFacing(e.target.value)}
                  placeholder="e.g. East / North-East"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Front Road Width</label>
                <input
                  type="text"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(e.target.value)}
                  placeholder="e.g. 30 Feet Wide"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          )}

          {propertyType === 'Land' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Land Classification</label>
                <select
                  value={landType}
                  onChange={(e) => setLandType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Agricultural">Agricultural Land / Farm</option>
                  <option value="Commercial">Highway Commercial Land</option>
                  <option value="Industrial">Industrial Zone Land</option>
                  <option value="Residential">Residential Approved Land</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Road Connectivity</label>
                <input
                  type="text"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(e.target.value)}
                  placeholder="e.g. 40 Feet Highway Touch"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description for Buyers
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key highlights: clear registry title, nearby schools/markets, loan availability, construction quality..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
            />
          </div>
        </div>

        {/* Step 5: Seller Contact Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Seller Contact Information</h2>
              <p className="text-xs text-slate-500">
                🔒 Privacy Guarantee: Your phone and WhatsApp are hidden until a buyer pays ₹50
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Seller Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Suresh Singhal"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Seller Type <span className="text-red-500">*</span>
              </label>
              <select
                value={sellerType}
                onChange={(e) => setSellerType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
              >
                <option value="Owner">Direct Owner</option>
                <option value="Dealer">Authorized Property Dealer</option>
                <option value="Builder">Builder / Developer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Calling Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={sellerMobile}
                onChange={(e) => setSellerMobile(e.target.value)}
                placeholder="e.g. +91 9897011223"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={sellerWhatsapp}
                onChange={(e) => setSellerWhatsapp(e.target.value)}
                placeholder="e.g. +91 9897011223"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-8 rounded-2xl text-base font-black shadow-lg hover:shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{loading ? 'Submitting Property...' : 'Submit & Publish Property For Sale'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
