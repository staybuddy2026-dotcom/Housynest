import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const updateDummyProperty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Property = (await import('./models/Property.js')).default;
    
    const props = await Property.find({
        $or: [
            { ownerContract: { $exists: false } },
            { 'ownerContract.contractTextEn': { $exists: false } },
            { 'ownerContract.contractTextEn': '' }
        ]
    });
    
    let count = 0;
    for (const p of props) {
      p.ownerContract = {
        mode: 'customize',
        contractTextEn: '<h1>Standard Rent Agreement</h1><p>This is a dummy customized agreement injected by the script to fix old properties.</p>',
        contractTextGu: '<h1>પ્રમાણભૂત ભાડા કરાર</h1><p>આ જૂની મિલકતોને ઠીક કરવા માટે સ્ક્રિપ્ટ દ્વારા દાખલ કરવામાં આવેલો ડમી કસ્ટમાઇઝ્ડ કરાર છે.</p>',
        termsAndConditions: [
          {
            titleEn: 'No Smoking',
            descriptionEn: 'Smoking is strictly prohibited inside the premises.',
            titleGu: 'ધૂમ્રપાન પ્રતિબંધિત',
            descriptionGu: 'પરિસરમાં ધૂમ્રપાનની સખત મનાઈ છે.'
          }
        ]
      };
      await p.save();
      count++;
    }
    console.log('Updated ' + count + ' old properties with dummy contract data');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

updateDummyProperty();
