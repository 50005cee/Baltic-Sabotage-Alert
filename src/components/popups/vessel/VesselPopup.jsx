// src/components/popups/vessel/VesselPopup.jsx
import React, { useState, useEffect } from 'react';
import { formatTimestamp } from '../../../utils/formatters';
import initSqlJs from 'sql.js';
// Import all flag components as an object.
import * as Flags from 'country-flag-icons/react/3x2';

// Helper component to load and display a ship thumbnail from a local SQLite DB.
const ShipThumbnail = ({ imo, flag }) => {
  const [thumbnailData, setThumbnailData] = useState(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(null);

  useEffect(() => {
    if (!imo) return;

    setLoadingThumbnail(true);

    // Initialize sql.js. Adjust locateFile if needed.
    initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    })
      .then(SQL => {
        // Define multiple possible file locations.
        const possiblePaths = [
          '/data/ships.db',
          './data/ships.db',
          '../data/ships.db',
          '/Baltic-Sabotage-Alert/data/ships.db'
        ];

        // Attempt to fetch the database file from one of the possible paths.
        const fetchDatabaseFile = async () => {
          let response = null;
          let successfulPath = '';
          for (const path of possiblePaths) {
            try {
              const result = await fetch(path);
              if (result.ok) {
                response = result;
                successfulPath = path;
                console.log(`Successfully loaded ships DB from: ${successfulPath}`);
                break;
              }
            } catch (err) {
              console.log(`Failed to fetch from ${path}:`, err);
              continue;
            }
          }
          if (!response) {
            throw new Error('Failed to load ships database file from any known location');
          }
          return response.arrayBuffer();
        };

        return fetchDatabaseFile().then(buffer => {
          // Open the database from the fetched binary data.
          const db = new SQL.Database(new Uint8Array(buffer));

          // Query the database for a record with the matching IMO.
          // Now fetching image_url, photographer, and capture_date.
          const stmt = db.prepare('SELECT image_url, photographer, capture_date FROM ships WHERE imo_number = ? LIMIT 1');
          stmt.bind([imo]);

          if (stmt.step()) {
            const row = stmt.getAsObject();
            if (row.image_url) {
              setThumbnailData(row);
            } else {
              setThumbnailError('Image URL not found for this ship.');
            }
          } else {
            setThumbnailError('No ship found with the given IMO.');
          }
          stmt.free();
          db.close();
          setLoadingThumbnail(false);
        });
      })
      .catch(err => {
        console.error('Error loading thumbnail from DB:', err);
        setThumbnailError(err.message);
        setLoadingThumbnail(false);
      });
  }, [imo]);

  if (loadingThumbnail) return <div>Loading thumbnail...</div>;
  if (thumbnailError) return <div>Error loading thumbnail: {thumbnailError}</div>;
  if (!thumbnailData) return null;

  // Lookup the flag component from the imported Flags.
  const FlagComponent = Flags[flag];

  return (
    <div
      className="ship-thumbnail"
      style={{ position: 'relative', marginBottom: '10px' }}
    >
      {/* Flag overlay in top left */}
      {flag && flag !== 'Unknown' && FlagComponent && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '2px',
          }}
        >
          <FlagComponent style={{ width: '24px', height: '24px' }} />
        </div>
      )}
      {/* Wrap the image in a hyperlink */}
      <a href={thumbnailData.image_url} target="_blank" rel="noopener noreferrer">
        <img
          src={thumbnailData.image_url}
          alt="Ship Thumbnail"
          style={{ maxWidth: '100%' }}
        />
      </a>
      {/* Overlay in bottom right for photographer copyright */}
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          padding: '2px 4px',
          fontSize: '12px'
        }}
      >
        &copy; {thumbnailData.photographer}
      </div>
      {/* Overlay in top right for calendar and capture date */}
      <div
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          padding: '2px 4px',
          fontSize: '12px'
        }}
      >
        📅 {thumbnailData.capture_date}
      </div>
    </div>
  );
};

const VesselPopup = ({ properties }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: Get flag (country code) based on first three digits of MMSI (MID)
  const getFlagFromMMSI = (mmsi) => {
    if (!mmsi) return 'Unknown';
    const mid = String(mmsi).substring(0, 3);
    const midMapping = {
      // 200-series (Europe and surrounding areas)
      "201": "AL", // Albania
      "202": "AD", // Andorra
      "203": "AT", // Austria
      "204": "PT", // Portugal
      "205": "BE", // Belgium
      "206": "BY", // Belarus
      "207": "BG", // Bulgaria
      "208": "VA", // Vatican
      "209": "CY", // Cyprus
      "210": "CY", // Cyprus
      "211": "DE", // Germany
      "212": "CY", // Cyprus
      "213": "GE", // Georgia
      "214": "MD", // Moldova
      "215": "MT", // Malta
      "216": "AM", // Armenia
      "218": "DE", // Germany
      "219": "DK", // Denmark
      "220": "DK", // Denmark
      "224": "ES", // Spain
      "225": "ES", // Spain
      "226": "FR", // France
      "227": "FR", // France
      "228": "FR", // France
      "229": "MT", // Malta
      "230": "FI", // Finland
      "231": "FO", // Faroe Islands
      "232": "GB", // United Kingdom
      "233": "GB", // United Kingdom
      "234": "GB", // United Kingdom
      "235": "GB", // United Kingdom
      "236": "GI", // Gibraltar
      "237": "GR", // Greece
      "238": "HR", // Croatia
      "239": "GR", // Greece
      "240": "GR", // Greece
      "241": "GR", // Greece
      "242": "MA", // Morocco
      "243": "HU", // Hungary
      "244": "NL", // Netherlands
      "245": "NL", // Netherlands
      "246": "NL", // Netherlands
      "247": "IT", // Italy
      "248": "MT", // Malta
      "249": "MT", // Malta
      "250": "IE", // Ireland
      "251": "IS", // Iceland
      "252": "LI", // Liechtenstein
      "253": "LU", // Luxembourg
      "254": "MC", // Monaco
      "255": "PT", // Portugal
      "256": "MT", // Malta
      "257": "NO", // Norway
      "258": "NO", // Norway
      "259": "NO", // Norway
      "261": "PL", // Poland
      "262": "ME", // Montenegro
      "263": "PT", // Portugal
      "264": "RO", // Romania
      "265": "SE", // Sweden
      "266": "SE", // Sweden
      "267": "SK", // Slovakia
      "268": "SM", // San Marino
      "269": "CH", // Switzerland
      "270": "CZ", // Czech Republic
      "271": "TR", // Turkey
      "272": "UA", // Ukraine
      "273": "RU", // Russia
      "274": "MK", // FYR Macedonia
      "275": "LV", // Latvia
      "276": "EE", // Estonia
      "277": "LT", // Lithuania
      "278": "SI", // Slovenia
      "279": "RS", // Serbia

      // 300-series (North America, Caribbean, and nearby)
      "301": "AI", // Anguilla
      "303": "US", // USA
      "304": "AG", // Antigua & Barbuda
      "305": "AG", // Antigua & Barbuda
      "306": "CW", // Curacao
      "307": "AW", // Aruba
      "308": "BS", // Bahamas
      "309": "BS", // Bahamas
      "310": "BM", // Bermuda
      "311": "BS", // Bahamas
      "312": "BZ", // Belize
      "314": "BB", // Barbados
      "316": "CA", // Canada
      "319": "KY", // Cayman Islands
      "321": "CR", // Costa Rica
      "323": "CU", // Cuba
      "325": "DM", // Dominica
      "327": "DO", // Dominican Republic
      "329": "GP", // Guadeloupe
      "330": "GD", // Grenada
      "331": "GL", // Greenland
      "332": "GT", // Guatemala
      "334": "HN", // Honduras
      "336": "HT", // Haiti
      "338": "US", // USA
      "339": "JM", // Jamaica
      "341": "KN", // St. Kitts & Nevis
      "343": "LC", // St. Lucia
      "345": "MX", // Mexico
      "347": "MQ", // Martinique
      "348": "MS", // Montserrat
      "350": "NI", // Nicaragua
      "351": "PA", // Panama
      "352": "PA", // Panama
      "353": "PA", // Panama
      "354": "PA", // Panama
      "355": "PA", // Panama
      "356": "PA", // Panama
      "357": "PA", // Panama
      "358": "PR", // Puerto Rico
      "359": "SV", // El Salvador
      "361": "PM", // St. Pierre & Miquelon
      "362": "TT", // Trinidad & Tobago
      "364": "TC", // Turks & Caicos Islands
      "366": "US", // USA
      "367": "US", // USA
      "368": "US", // USA
      "369": "US", // USA
      "370": "PA", // Panama
      "371": "PA", // Panama
      "372": "PA", // Panama
      "373": "PA", // Panama
      "374": "PA", // Panama
      "375": "VC", // St. Vincent & the Grenadines
      "376": "VC", // St. Vincent & the Grenadines
      "377": "VC", // St. Vincent & the Grenadines
      "378": "VG", // British Virgin Islands
      "379": "VI", // US Virgin Islands

      // 400-series (Asia, Middle East)
      "401": "AF", // Afghanistan
      "403": "SA", // Saudi Arabia
      "405": "BD", // Bangladesh
      "408": "BH", // Bahrain
      "410": "BT", // Bhutan
      "412": "CN", // China
      "413": "CN", // China
      "414": "CN", // China
      "416": "TW", // Taiwan
      "417": "LK", // Sri Lanka
      "419": "IN", // India
      "422": "IR", // Iran
      "423": "AZ", // Azerbaijan
      "425": "IQ", // Iraq
      "428": "IL", // Israel
      "431": "JP", // Japan
      "432": "JP", // Japan
      "434": "TM", // Turkmenistan
      "436": "KZ", // Kazakhstan
      "437": "UZ", // Uzbekistan
      "438": "JO", // Jordan
      "440": "KR", // Korea (South)
      "441": "KR", // Korea (South)
      "443": "PS", // Palestine
      "445": "KP", // DPR Korea
      "447": "KW", // Kuwait
      "450": "LB", // Lebanon
      "451": "KG", // Kyrgyz Republic
      "453": "MO", // Macao
      "455": "MV", // Maldives
      "457": "MN", // Mongolia
      "459": "NP", // Nepal
      "461": "OM", // Oman
      "463": "PK", // Pakistan
      "466": "QA", // Qatar
      "468": "SY", // Syria
      "470": "AE", // UAE
      "471": "AE", // UAE
      "472": "TJ", // Tajikistan
      "473": "YE", // Yemen
      "475": "YE", // Yemen
      "477": "HK", // Hong Kong
      "478": "BA", // Bosnia and Herzegovina

      // 500-series (Oceania & Southeast Asia)
      "501": "AQ", // Antarctica
      "503": "AU", // Australia
      "506": "MM", // Myanmar
      "508": "BN", // Brunei
      "510": "FM", // Micronesia
      "511": "PW", // Palau
      "512": "NZ", // New Zealand
      "514": "KH", // Cambodia
      "515": "KH", // Cambodia
      "516": "CX", // Christmas Island
      "518": "CK", // Cook Islands
      "520": "FJ", // Fiji
      "523": "CC", // Cocos (Keeling) Islands
      "525": "ID", // Indonesia
      "529": "KI", // Kiribati
      "531": "LA", // Laos
      "533": "MY", // Malaysia
      "536": "MP", // Northern Mariana Islands
      "538": "MH", // Marshall Islands
      "540": "NC", // New Caledonia
      "542": "NU", // Niue
      "544": "NR", // Nauru
      "546": "PF", // French Polynesia
      "548": "PH", // Philippines
      "553": "PG", // Papua New Guinea
      "555": "PN", // Pitcairn Islands
      "557": "SB", // Solomon Islands
      "559": "AS", // American Samoa
      "561": "WS", // Samoa
      "563": "SG", // Singapore
      "564": "SG", // Singapore
      "565": "SG", // Singapore
      "566": "SG", // Singapore
      "567": "TH", // Thailand
      "570": "TO", // Tonga
      "572": "TV", // Tuvalu
      "574": "VN", // Vietnam
      "576": "VU", // Vanuatu
      "577": "VU", // Vanuatu
      "578": "WF", // Wallis & Futuna Islands

      // 600-series (Africa)
      "601": "ZA", // South Africa
      "603": "AO", // Angola
      "605": "DZ", // Algeria
      "607": "TF", // St Paul & Amsterdam Islands
      "608": "IO", // Ascension Island (British Indian Ocean Territory)
      "609": "BI", // Burundi
      "610": "BJ", // Benin
      "611": "BW", // Botswana
      "612": "CF", // Central African Republic
      "613": "CM", // Cameroon
      "615": "CG", // Congo
      "616": "KM", // Comoros
      "617": "CV", // Cape Verde
      "618": "AQ", // Antarctica
      "619": "CI", // Ivory Coast
      "620": "KM", // Comoros
      "621": "DJ", // Djibouti
      "622": "EG", // Egypt
      "624": "ET", // Ethiopia
      "625": "ER", // Eritrea
      "626": "GA", // Gabon
      "627": "GH", // Ghana
      "629": "GM", // Gambia
      "630": "GW", // Guinea-Bissau
      "631": "GQ", // Equatorial Guinea
      "632": "GN", // Guinea
      "633": "BF", // Burkina Faso
      "634": "KE", // Kenya
      "635": "AQ", // Antarctica
      "636": "LR", // Liberia
      "637": "LR", // Liberia
      "642": "LY", // Libya
      "644": "LS", // Lesotho
      "645": "MU", // Mauritius
      "647": "MG", // Madagascar
      "649": "ML", // Mali
      "650": "MZ", // Mozambique
      "654": "MR", // Mauritania
      "655": "MW", // Malawi
      "656": "NE", // Niger
      "657": "NG", // Nigeria
      "659": "NA", // Namibia
      "660": "RE", // Réunion
      "661": "RW", // Rwanda
      "662": "SD", // Sudan
      "663": "SN", // Senegal
      "664": "SC", // Seychelles
      "665": "SH", // St. Helena
      "666": "SO", // Somalia
      "667": "SL", // Sierra Leone
      "668": "ST", // São Tomé & Príncipe
      "669": "SZ", // Swaziland (Eswatini)
      "670": "TD", // Chad
      "671": "TG", // Togo
      "672": "TN", // Tunisia
      "674": "TZ", // Tanzania
      "675": "UG", // Uganda
      "676": "CD", // DR Congo
      "677": "TZ", // Tanzania
      "678": "ZM", // Zambia
      "679": "ZW", // Zimbabwe

      // 700-series (South America)
      "701": "AR", // Argentina
      "710": "BR", // Brazil
      "720": "BO", // Bolivia
      "725": "CL", // Chile
      "730": "CO", // Colombia
      "735": "EC", // Ecuador
      "740": "UK", // United Kingdom (used here for the Falkland Islands/UK territories)
      "745": "GF", // Guiana (French Guiana)
      "750": "GY", // Guyana
      "755": "PY", // Paraguay
      "760": "PE", // Peru
      "765": "SR", // Suriname
      "770": "UY", // Uruguay
      "775": "VE"  // Venezuela
    };
    return midMapping[mid] || 'Unknown';
  };

  // Helper mapping from country codes to country names.
  const countryNames = {
    AL: "Albania",
    AD: "Andorra",
    AT: "Austria",
    PT: "Portugal",
    BE: "Belgium",
    BY: "Belarus",
    BG: "Bulgaria",
    VA: "Vatican",
    CY: "Cyprus",
    DE: "Germany",
    GE: "Georgia",
    MD: "Moldova",
    MT: "Malta",
    AM: "Armenia",
    DK: "Denmark",
    ES: "Spain",
    FR: "France",
    FI: "Finland",
    FO: "Faroe Islands",
    GB: "United Kingdom",
    GI: "Gibraltar",
    GR: "Greece",
    HR: "Croatia",
    MA: "Morocco",
    HU: "Hungary",
    NL: "Netherlands",
    IT: "Italy",
    IE: "Ireland",
    IS: "Iceland",
    LI: "Liechtenstein",
    LU: "Luxembourg",
    MC: "Monaco",
    NO: "Norway",
    PL: "Poland",
    ME: "Montenegro",
    RO: "Romania",
    SE: "Sweden",
    SK: "Slovakia",
    SM: "San Marino",
    CH: "Switzerland",
    CZ: "Czech Republic",
    TR: "Turkey",
    UA: "Ukraine",
    RU: "Russia",
    MK: "North Macedonia",
    LV: "Latvia",
    EE: "Estonia",
    LT: "Lithuania",
    SI: "Slovenia",
    RS: "Serbia",
    AI: "Anguilla",
    US: "USA",
    AG: "Antigua & Barbuda",
    CW: "Curacao",
    AW: "Aruba",
    BS: "Bahamas",
    BM: "Bermuda",
    BZ: "Belize",
    BB: "Barbados",
    CA: "Canada",
    KY: "Cayman Islands",
    CR: "Costa Rica",
    CU: "Cuba",
    DM: "Dominica",
    DO: "Dominican Republic",
    GP: "Guadeloupe",
    GD: "Grenada",
    GL: "Greenland",
    GT: "Guatemala",
    HN: "Honduras",
    HT: "Haiti",
    JM: "Jamaica",
    KN: "St. Kitts & Nevis",
    LC: "St. Lucia",
    MX: "Mexico",
    MQ: "Martinique",
    MS: "Montserrat",
    NI: "Nicaragua",
    PA: "Panama",
    PR: "Puerto Rico",
    SV: "El Salvador",
    PM: "St. Pierre & Miquelon",
    TT: "Trinidad & Tobago",
    TC: "Turks & Caicos Islands",
    VC: "St. Vincent & the Grenadines",
    VG: "British Virgin Islands",
    VI: "US Virgin Islands",
    AF: "Afghanistan",
    SA: "Saudi Arabia",
    BD: "Bangladesh",
    BH: "Bahrain",
    BT: "Bhutan",
    CN: "China",
    TW: "Taiwan",
    LK: "Sri Lanka",
    IN: "India",
    IR: "Iran",
    AZ: "Azerbaijan",
    IQ: "Iraq",
    IL: "Israel",
    JP: "Japan",
    TM: "Turkmenistan",
    KZ: "Kazakhstan",
    UZ: "Uzbekistan",
    JO: "Jordan",
    KR: "South Korea",
    PS: "Palestine",
    KP: "North Korea",
    KW: "Kuwait",
    LB: "Lebanon",
    KG: "Kyrgyzstan",
    MO: "Macao",
    MV: "Maldives",
    MN: "Mongolia",
    NP: "Nepal",
    OM: "Oman",
    PK: "Pakistan",
    QA: "Qatar",
    SY: "Syria",
    AE: "UAE",
    TJ: "Tajikistan",
    YE: "Yemen",
    HK: "Hong Kong",
    BA: "Bosnia and Herzegovina",
    AQ: "Antarctica",
    AU: "Australia",
    MM: "Myanmar",
    BN: "Brunei",
    FM: "Micronesia",
    PW: "Palau",
    NZ: "New Zealand",
    KH: "Cambodia",
    CX: "Christmas Island",
    CK: "Cook Islands",
    FJ: "Fiji",
    CC: "Cocos (Keeling) Islands",
    ID: "Indonesia",
    KI: "Kiribati",
    LA: "Laos",
    MY: "Malaysia",
    MP: "Northern Mariana Islands",
    MH: "Marshall Islands",
    NC: "New Caledonia",
    NU: "Niue",
    NR: "Nauru",
    PF: "French Polynesia",
    PH: "Philippines",
    PG: "Papua New Guinea",
    PN: "Pitcairn Islands",
    SB: "Solomon Islands",
    AS: "American Samoa",
    WS: "Samoa",
    SG: "Singapore",
    TH: "Thailand",
    TO: "Tonga",
    TV: "Tuvalu",
    VN: "Vietnam",
    VU: "Vanuatu",
    WF: "Wallis & Futuna Islands",
    ZA: "South Africa",
    AO: "Angola",
    DZ: "Algeria",
    TF: "French Southern Territories",
    IO: "British Indian Ocean Territory",
    BI: "Burundi",
    BJ: "Benin",
    BW: "Botswana",
    CF: "Central African Republic",
    CM: "Cameroon",
    CG: "Congo",
    KM: "Comoros",
    CV: "Cape Verde",
    CI: "Ivory Coast",
    DJ: "Djibouti",
    EG: "Egypt",
    ET: "Ethiopia",
    ER: "Eritrea",
    GA: "Gabon",
    GH: "Ghana",
    GM: "Gambia",
    GW: "Guinea-Bissau",
    GQ: "Equatorial Guinea",
    GN: "Guinea",
    BF: "Burkina Faso",
    KE: "Kenya",
    LR: "Liberia",
    LY: "Libya",
    LS: "Lesotho",
    MU: "Mauritius",
    MG: "Madagascar",
    ML: "Mali",
    MZ: "Mozambique",
    MR: "Mauritania",
    MW: "Malawi",
    NE: "Niger",
    NG: "Nigeria",
    NA: "Namibia",
    RE: "Réunion",
    RW: "Rwanda",
    SD: "Sudan",
    SN: "Senegal",
    SC: "Seychelles",
    SH: "St. Helena",
    SO: "Somalia",
    SL: "Sierra Leone",
    ST: "São Tomé & Príncipe",
    SZ: "Eswatini",
    TD: "Chad",
    TG: "Togo",
    TN: "Tunisia",
    TZ: "Tanzania",
    UG: "Uganda",
    CD: "DR Congo",
    ZM: "Zambia",
    ZW: "Zimbabwe",
    AR: "Argentina",
    BR: "Brazil",
    BO: "Bolivia",
    CL: "Chile",
    CO: "Colombia",
    EC: "Ecuador",
    GF: "French Guiana",
    GY: "Guyana",
    PY: "Paraguay",
    PE: "Peru",
    SR: "Suriname",
    UY: "Uruguay",
    VE: "Venezuela"
  };

  // When the popup mounts, fetch extra vessel metadata by MMSI.
  useEffect(() => {
    if (!properties.mmsi) return;

    setLoading(true);
    fetch(`https://meri.digitraffic.fi/api/ais/v1/vessels/${properties.mmsi}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setMetadata(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching vessel metadata:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [properties.mmsi]);

  // Helper function to render a label/value row.
  const renderRow = (label, value) => (
    <div className="vessel-popup-row">
      <span className="vessel-popup-label">{label}:</span>
      <span className="vessel-popup-value">{value || 'N/A'}</span>
    </div>
  );

  // Combine properties from the feature and the fetched metadata.
  const combined = {
    mmsi: properties.mmsi,
    name: metadata?.name || properties.name,
    imo: metadata?.imo || properties.imo,
    destination: metadata?.destination || properties.destination,
    shipType: metadata?.shipType || properties.shipType,
    eta: metadata?.eta || properties.eta,
    timestamp: properties.timestampExternal,
    sog: properties.sog,
    cog: properties.cog,
    // Compute flag from MMSI using our helper function.
    flag: getFlagFromMMSI(properties.mmsi),
  };

  // Look up the full country name using the flag (country code).
  const countryName = countryNames[combined.flag] || 'Unknown Country';

  // Decode ETA from a bit-packed integer.
  const formatETA = (eta, baseTimestamp) => {
    if (!eta || eta === 0) return 'N/A';

    const month = (eta >> 16) & 0xF;
    const day = (eta >> 11) & 0x1F;
    const hour = (eta >> 6) & 0x1F;
    const minute = eta & 0x3F;

    if (month === 0 || day === 0 || hour === 24 || minute === 60) {
      return 'N/A';
    }

    let year = baseTimestamp ? new Date(baseTimestamp).getFullYear() : new Date().getFullYear();
    let etaDateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));
    if (baseTimestamp && etaDateUTC < new Date(baseTimestamp)) {
      etaDateUTC = new Date(Date.UTC(year + 1, month - 1, day, hour, minute));
    }

    // Shift by +3 hours for UTC+3.
    const etaDateUTCPlus3 = new Date(etaDateUTC.getTime() + 3 * 60 * 60 * 1000);
    return etaDateUTCPlus3.toISOString().slice(0, 16).replace('T', ' ') + ' UTC+3';
  };

  // Helper function to return an AIS type summary from the raw ship type code.
  const getShipTypeSummary = (shipType) => {
    if (shipType === undefined || shipType === null) return 'N/A';
    const type = Number(shipType);
    if (type >= 10 && type <= 19) {
      return 'Reserved / Unspecified';
    } else if (type >= 20 && type <= 28) {
      return 'Wing In Ground Effect Vessel';
    } else if (type === 29) {
      return 'Search and Rescue';
    } else if (type === 30) {
      return 'Fishing Vessel';
    } else if (type === 31 || type === 32) {
      return 'Tug';
    } else if (type === 33) {
      return 'Dredger';
    } else if (type === 34) {
      return 'Dive Vessel';
    } else if (type === 35) {
      return 'Naval / Military Ops';
    } else if (type === 36) {
      return 'Sailing Vessel';
    } else if (type === 37) {
      return 'Pleasure Craft';
    } else if (type === 38 || type === 39) {
      return 'Reserved / Unspecified';
    } else if (type >= 40 && type <= 49) {
      return 'High-Speed Craft';
    } else if (type === 50) {
      return 'Pilot Vessel';
    } else if (type === 51) {
      return 'Search and Rescue';
    } else if (type === 52) {
      return 'Tug / Icebreaker';
    } else if (type === 53) {
      return 'Port Tender';
    } else if (type === 54) {
      return 'Anti-Pollution Vessel';
    } else if (type === 55) {
      return 'Patrol Vessel';
    } else if (type === 56 || type === 57) {
      return 'Local Vessel';
    } else if (type === 58) {
      return 'Hospital Ship';
    } else if (type === 59) {
      return 'Special Craft';
    } else if (type >= 60 && type <= 69) {
      return 'Passenger Vessel';
    } else if (type === 70) {
      return 'Cargo Vessel';
    } else if (type === 71) {
      return 'Cargo - Hazard X';
    } else if (type === 72) {
      return 'Cargo - Hazard Y';
    } else if (type === 73) {
      return 'Cargo - Hazard Z';
    } else if (type === 74) {
      return 'Cargo - Hazard OS';
    } else if (type >= 75 && type <= 79) {
      return 'Cargo Vessel';
    } else if (type === 80) {
      return 'Tanker';
    } else if (type === 81) {
      return 'Tanker - Hazard A';
    } else if (type === 82) {
      return 'Tanker - Hazard B';
    } else if (type === 83) {
      return 'Tanker - Hazard C';
    } else if (type === 84) {
      return 'Tanker - Hazard D';
    } else if (type >= 85 && type <= 89) {
      return 'Tanker';
    } else if (type >= 90 && type <= 99) {
      return 'Other';
    } else {
      return 'Unknown';
    }
  };

  // Return "code / summary" for ship type.
  const formatShipType = () => {
    if (combined.shipType === undefined || combined.shipType === null) {
      return 'N/A';
    }
    const code = combined.shipType;
    const summary = getShipTypeSummary(code);
    return `${code} / ${summary}`;
  };

  return (
    <div className="vessel-popup">
      <div className="vessel-popup-header">
        <h3>Vessel Info</h3>
      </div>
      <div className="vessel-popup-content">
        {loading && <div>Loading vessel details...</div>}
        {error && <div>Error loading metadata: {error}</div>}
        {/* Display ship thumbnail if IMO is available */}
        {combined.imo && <ShipThumbnail imo={combined.imo} flag={combined.flag} />}
        {renderRow('Name', combined.name)}
        {renderRow('Flag State', countryName)}
        {renderRow('MMSI', combined.mmsi)}
        {renderRow('IMO', combined.imo)}
        {renderRow('Destination', combined.destination)}
        {renderRow('ETA', formatETA(combined.eta, combined.timestamp))}
        {renderRow('Last seen', formatTimestamp(combined.timestamp))}
        {renderRow('Speed', combined.sog ? `${combined.sog.toFixed(1)} knots` : 'N/A')}
        {renderRow('Course', combined.cog ? `${combined.cog.toFixed(1)}°` : 'N/A')}
        {renderRow('Ship Type', formatShipType())}
      </div>
    </div>
  );
};

export default VesselPopup;
