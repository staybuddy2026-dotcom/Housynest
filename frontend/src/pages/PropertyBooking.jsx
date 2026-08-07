import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import { useLenis } from 'lenis/react';

// Modular Subcomponents
import BookingStepper from '../components/booking/BookingStepper';
import BookingStepProfile from '../components/booking/BookingStepProfile';
import BookingStepDocuments from '../components/booking/BookingStepDocuments';
import BookingStepPayment from '../components/booking/BookingStepPayment';
import BookingSidebarCard from '../components/booking/BookingSidebarCard';
import BookingSuccessCard from '../components/booking/BookingSuccessCard';

const PropertyBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const lenis = useLenis();

  // State data passed from BookNowModal or property details
  const stateData = location.state || {};
  const [property, setProperty] = useState(stateData.property || null);
  const [loading, setLoading] = useState(!stateData.property);

  // Stepper State (1: Complete Profile, 2: Document Verification, 3: Terms & Payment)
  const [currentStep, setCurrentStep] = useState(1);

  // Room & Bed Selection
  const [selectedRoom, setSelectedRoom] = useState(stateData.selectedRoom || null);
  const [selectedBedName, setSelectedBedName] = useState(stateData.selectedBedName || '');

  // Booking Info
  const defaultMoveIn = new Date();
  defaultMoveIn.setDate(defaultMoveIn.getDate() + 1);
  const formattedDefaultMoveIn = defaultMoveIn.toISOString().split('T')[0];

  const [moveInDate, setMoveInDate] = useState(formattedDefaultMoveIn);
  const [moveOutDate, setMoveOutDate] = useState('');

  // User Profile Info
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  const nameParts = (user.fullName || user.name || '').trim().split(' ');
  const defaultFirstName = nameParts[0] || 'Khush';
  const defaultLastName = nameParts.slice(1).join(' ') || 'Prajapati';

  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState(user.gender || 'Male');
  const [mobileNumber, setMobileNumber] = useState(user.phone || user.mobile || '9824970199');
  const [whatsappNumber, setWhatsappNumber] = useState(user.phone || user.mobile || '9824970199');
  const [email, setEmail] = useState(user.email || '');
  const [institutionName, setInstitutionName] = useState('');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Father');

  // Payment Selection ('token' or 'full')
  const initialIsPG = stateData.property ? (stateData.property.type === 'PG' || stateData.property.propertyType === 'PG') : true;
  const [paymentType, setPaymentType] = useState(initialIsPG ? 'token' : 'full');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Document Verification (Step 2)
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [isDigiLockerConnected, setIsDigiLockerConnected] = useState(false);

  // Terms & Submission (Step 3)
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Dropdown options
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const relationshipOptions = [
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Friend', label: 'Friend' },
    { value: 'Guardian', label: 'Guardian' }
  ];

  // Scroll to top on step change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentStep, lenis]);

  // Fetch property if missing from location state
  useEffect(() => {
    if (!property && id) {
      const fetchProperty = async () => {
        try {
          const res = await fetch(`/api/properties/${id}`);
          if (res.ok) {
            const data = await res.json();
            const mapped = {
              ...data,
              id: data._id,
              title: data.pgName || (data.bhkType ? `${data.bhkType} ${data.propertyCategory}` : data.propertyCategory) || 'Property',
              location: `${data.locality || ''}, ${data.city || ''}`.replace(/^, | , $/g, ''),
              price: data.monthlyRent || '12000'
            };
            setProperty(mapped);
          }
        } catch (err) {
          console.error('Failed to fetch property', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, property]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="lucide:loader-2" className="w-10 h-10 animate-spin text-[#0B4F48]" />
          <p className="text-sm font-semibold text-[#062F26]">Loading Booking Portal...</p>
        </div>
      </div>
    );
  }

  const propTitle = property?.title || property?.pgName || 'Boys PG in Bhandup West #835';
  const propLocation = property?.location || property?.locality || 'Bhandup West, Mumbai';
  const isPG = property?.propertyType === 'PG' || property?.type === 'PG';

  useEffect(() => {
    if (property && !isPG) {
      setPaymentType('full');
    }
  }, [property, isPG]);

  // Base pricing calculations (Token Amount is strictly 40% of Monthly Rent + ₹300 Stamp Fees)
  const stampFees = 300;
  const rawRent = selectedRoom?.rent || property?.monthlyRent || property?.price || property?.rent || 12000;
  const baseRent = typeof rawRent === 'number' ? rawRent : (parseInt(String(rawRent).replace(/\D/g, ''), 10) || 12000);
  const deposit = selectedRoom?.deposit ? (Number(selectedRoom.deposit) || 0) : (property?.securityAmount ? (parseInt(String(property.securityAmount).replace(/\D/g, ''), 10) || baseRent) : baseRent);
  const maintenance = property?.maintenanceCharges ? (parseInt(String(property.maintenanceCharges).replace(/\D/g, ''), 10) || 0) : 0;

  // 40% Token Amount vs Full Amount (both include ₹300 stamp & agreement fees)
  const tokenAmount = Math.round(baseRent * 0.40);
  const tokenPayableNow = tokenAmount + stampFees;
  const fullPayableNow = baseRent + deposit + maintenance + stampFees;
  const payNowAmount = paymentType === 'token' ? tokenPayableNow : fullPayableNow;

  // DYNAMIC STEP VALIDATION FOR FORM & SIDEBAR BUTTONS
  const isStep1Valid = Boolean(
    moveInDate &&
    firstName.trim() &&
    lastName.trim() &&
    dob &&
    gender &&
    mobileNumber.trim().length >= 10 &&
    email.trim().includes('@') &&
    emergencyName.trim() &&
    emergencyPhone.trim().length >= 10
  );

  const isStep2Valid = Boolean(
    isDigiLockerConnected || (aadhaarFront && aadhaarBack)
  );

  const isStep3Valid = Boolean(
    agreedTerms
  );

  // ALL STEPS MUST BE FULLY FILLED FOR SIDEBAR BUTTON TO BECOME ACTIVE
  const isAllStepsValid = Boolean(isStep1Valid && isStep2Valid && isStep3Valid);

  // STEP 1 VALIDATION
  const validateStep1 = () => {
    if (!moveInDate) {
      toast.error('Please select a valid Move-In date');
      return false;
    }
    if (!firstName.trim()) {
      toast.error('Please enter your First Name');
      return false;
    }
    if (!lastName.trim()) {
      toast.error('Please enter your Last Name');
      return false;
    }
    if (!dob) {
      toast.error('Please select your Date of Birth');
      return false;
    }
    if (!gender) {
      toast.error('Please select your Gender');
      return false;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      toast.error('Please enter a valid 10-digit Mobile Number');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid Email address');
      return false;
    }
    if (!emergencyName.trim()) {
      toast.error('Please enter Emergency Contact Name');
      return false;
    }
    if (!emergencyPhone.trim() || emergencyPhone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit Emergency Contact Phone Number');
      return false;
    }
    return true;
  };

  // STEP 2 VALIDATION
  const validateStep2 = () => {
    if (!isDigiLockerConnected && (!aadhaarFront || !aadhaarBack)) {
      toast.error('Please upload both Aadhaar Front & Back photos or connect DigiLocker');
      return false;
    }
    return true;
  };

  // Handle Navigation / Next step
  const handleContinue = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      toast.success('Profile details verified! Proceeding to Document Verification');
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
      toast.success('Documents verified! Proceeding to Terms & Payment');
    } else if (currentStep === 3) {
      handleFinalBookingSubmit();
    }
  };

  // Handle Direct Stepper Click Navigation
  const handleStepClick = (step) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (step === 3) {
      if (validateStep1() && validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  // Submit Final Booking Request
  const handleFinalBookingSubmit = async () => {
    if (!agreedTerms) {
      toast.error('Please accept the Terms & Conditions to confirm your booking');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        propertyId: property?.id || property?._id || id,
        moveInDate: moveInDate,
        expectedMoveOutDate: moveOutDate || null,
        personalInfo: {
          firstName,
          lastName,
          dob,
          gender,
          mobileNumber,
          whatsappNumber,
          email,
          institutionName
        },
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelationship
        },
        roomDetails: {
          roomName: selectedRoom?.roomName || null,
          sharingType: selectedRoom?.sharingType || null,
          bedName: selectedBedName || null,
        },
        paymentDetails: {
          amount: payNowAmount,
          status: 'Pending',
          paymentMethod: paymentType === 'token' ? 'Token Amount' : 'Full Payment'
        }
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (res.ok) {
        const result = await res.json();
        // The backend generates the actual booking ID, but we can display a custom ref on success page
        setBookingRef(result._id.substring(result._id.length - 8).toUpperCase());
        setBookingSuccess(true);
        toast.success(result.status === 'Confirmed' ? 'Booking Confirmed Successfully!' : 'Booking Request Submitted Successfully!');
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to submit booking');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      toast.error('An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-6 font-sans text-slate-800 antialiased">
      <div className="max-w-340 3xl:max-w-420 mx-auto px-4 sm:px-6 xl:px-0 space-y-4">

        {/* TOP BAR: BACK TO PROPERTY BUTTON */}
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => navigate(`/properties/${id}`)}
            className="flex items-center gap-2 text-slate-700 hover:text-[#062F26] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4 text-slate-600" />
            Back to Property
          </button>
        </div>

        {!bookingSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT MAIN CONTENT FORM COLUMN (~68% width) */}
            <div className="lg:col-span-8 space-y-6">

              {/* CHEVRON RIBBON STEPPER */}
              <BookingStepper
                currentStep={currentStep}
                handleStepClick={handleStepClick}
                paymentType={paymentType}
                isPG={isPG}
              />

              {/* STEP 1: COMPLETE PROFILE */}
              {currentStep === 1 && (
                <BookingStepProfile
                  moveInDate={moveInDate}
                  setMoveInDate={setMoveInDate}
                  moveOutDate={moveOutDate}
                  setMoveOutDate={setMoveOutDate}
                  firstName={firstName}
                  setFirstName={setFirstName}
                  lastName={lastName}
                  setLastName={setLastName}
                  dob={dob}
                  setDob={setDob}
                  gender={gender}
                  setGender={setGender}
                  mobileNumber={mobileNumber}
                  setMobileNumber={setMobileNumber}
                  whatsappNumber={whatsappNumber}
                  setWhatsappNumber={setWhatsappNumber}
                  email={email}
                  setEmail={setEmail}
                  institutionName={institutionName}
                  setInstitutionName={setInstitutionName}
                  emergencyName={emergencyName}
                  setEmergencyName={setEmergencyName}
                  emergencyPhone={emergencyPhone}
                  setEmergencyPhone={setEmergencyPhone}
                  emergencyRelationship={emergencyRelationship}
                  setEmergencyRelationship={setEmergencyRelationship}
                  genderOptions={genderOptions}
                  relationshipOptions={relationshipOptions}
                  tokenAmount={tokenAmount}
                  isStep1Valid={isStep1Valid}
                  handleContinue={handleContinue}
                />
              )}

              {/* STEP 2: DOCUMENT VERIFICATION */}
              {currentStep === 2 && (
                <BookingStepDocuments
                  isDigiLockerConnected={isDigiLockerConnected}
                  setIsDigiLockerConnected={setIsDigiLockerConnected}
                  aadhaarFront={aadhaarFront}
                  setAadhaarFront={setAadhaarFront}
                  aadhaarBack={aadhaarBack}
                  setAadhaarBack={setAadhaarBack}
                  setCurrentStep={setCurrentStep}
                  handleContinue={handleContinue}
                  isStep2Valid={isStep2Valid}
                />
              )}

              {/* STEP 3: TERMS & PAYMENT AGREEMENT */}
              {currentStep === 3 && (
                <BookingStepPayment
                  isPG={isPG}
                  paymentType={paymentType}
                  propTitle={propTitle}
                  propLocation={propLocation}
                  moveInDate={moveInDate}
                  moveOutDate={moveOutDate}
                  selectedBedName={selectedBedName}
                  selectedRoom={selectedRoom}
                  firstName={firstName}
                  lastName={lastName}
                  mobileNumber={mobileNumber}
                  email={email}
                  dob={dob}
                  emergencyName={emergencyName}
                  emergencyPhone={emergencyPhone}
                  emergencyRelationship={emergencyRelationship}
                  baseRent={baseRent}
                  deposit={deposit}
                  agreedTerms={agreedTerms}
                  setAgreedTerms={setAgreedTerms}
                  setCurrentStep={setCurrentStep}
                  handleContinue={handleContinue}
                  isStep3Valid={isStep3Valid}
                  isSubmitting={isSubmitting}
                />
              )}

            </div>

            {/* RIGHT STICKY SIDEBAR COLUMN (~32% width) */}
            <BookingSidebarCard
              isPG={isPG}
              propTitle={propTitle}
              propLocation={propLocation}
              moveInDate={moveInDate}
              selectedRoom={selectedRoom}
              selectedBedName={selectedBedName}
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              showBreakdown={showBreakdown}
              setShowBreakdown={setShowBreakdown}
              baseRent={baseRent}
              deposit={deposit}
              maintenance={maintenance}
              stampFees={stampFees}
              tokenAmount={tokenAmount}
              tokenPayableNow={tokenPayableNow}
              fullPayableNow={fullPayableNow}
              payNowAmount={payNowAmount}
              handleFinalBookingSubmit={handleFinalBookingSubmit}
              isAllStepsValid={isAllStepsValid}
              isSubmitting={isSubmitting}
            />

          </div>
        ) : (
          /* SUCCESS SCREEN */
          <BookingSuccessCard
            isPG={isPG}
            bookingRef={bookingRef}
            firstName={firstName}
            selectedBedName={selectedBedName}
            propTitle={propTitle}
            moveInDate={moveInDate}
            id={id}
            navigate={navigate}
          />
        )}

      </div>
    </div>
  );
};

export default PropertyBooking;
