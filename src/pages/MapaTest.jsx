import { Grid, Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

function MapaTeste01() {
  // const { isLoaded } = useJsApiLoader({
  //   id: 'google-map-script',
  //   googleMapsApiKey: 'AIzaSyBGIJiyrI6-sInHWd8zI_hmYST_G1frJoo',
  // });

  const [searchBox, setSearchBox] = useState();
  const [map, setMap] = useState();

  const markers = [
    {
      text: 'Posição 1',
      center: {
        lat: -21.990494633021157,
        lng: -46.79358754417266,
      },
    },
    {
      text: 'Posição 2',
      center: {
        lat: -21.964065368850427,
        lng: -46.81785304046889,
      },
    },
    {
      text: 'Posição 3',
      center: {
        lat: -21.96125940670759,
        lng: -46.80830437666377,
      },
    },
  ];

  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  const options = {
    center: {
      lat: -21.990494633021157,
      lng: -46.79358754417266,
    },
    zoom: 15,
    disableDefaultUI: true,
  };

  function onLoad(ref) {
    setSearchBox(ref);
  }

  function onMapLoad(newMap) {
    setMap(newMap);
  }

  function onPlacesChanged() {
    const places = searchBox.getPlaces();
    console.log(places);
    const place = places[0];
    const location = {
      lat: place?.geometry?.location?.lat() || 0,
      lng: place?.geometry?.location?.lng() || 0,
    };
    map?.panTo(location);
  }

  const center = {
    lat: -21.990494633021157,
    lng: -46.79358754417266,
  };

  return (
    <Box width="100vw" height="100vh">
      <LoadScript googleMapsApiKey="AIzaSyBGIJiyrI6-sInHWd8zI_hmYST_G1frJoo" libraries={['places']}>
        <GoogleMap onLoad={onMapLoad} mapContainerStyle={containerStyle} options={options}>
          <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
            <Grid container>
              <Grid item md={5}>
                <TextField variant="filled" size="small" fullWidth label="teste" sx={{ border: 2 }} />
              </Grid>
            </Grid>
          </StandaloneSearchBox>
          <Marker position={{ lat: -21.990494633021157, lng: -46.79358754417266 }} />

          {markers.map((mark) => (
            <Marker key={mark.text} position={mark.center} />
          ))}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
}

function MapaTeste02() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBGIJiyrI6-sInHWd8zI_hmYST_G1frJoo',
  });

  const markers = [
    {
      text: 'Posição 1',
      center: {
        lat: -21.990494633021157,
        lng: -46.79358754417266,
      },
    },
    {
      text: 'Posição 2',
      center: {
        lat: -21.964065368850427,
        lng: -46.81785304046889,
      },
    },
    {
      text: 'Posição 3',
      center: {
        lat: -21.96125940670759,
        lng: -46.80830437666377,
      },
    },
  ];

  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  const options = {
    center: {
      lat: -21.990494633021157,
      lng: -46.79358754417266,
    },
    zoom: 15,
    // disableDefaultUI: true,
  };

  const center = {
    lat: -21.990494633021157,
    lng: -46.79358754417266,
  };

  const markerOptions = {
    // opacity: 0.2,
    label: {
      color: '#fcba03',
      text: 'teste do titulo',
    },
    draggable: true,
  };

  return isLoaded ? (
    <Box width="100vw" height="100vh">
      <GoogleMap options={options} mapContainerStyle={containerStyle}>
        {/* <Marker position={center} /> */}
        {markers.map((mark) => (
          <Marker key={mark.text} position={mark.center} label={mark.text} options={markerOptions} />
        ))}
      </GoogleMap>
    </Box>
  ) : null;
}

// export default MapaTeste01;
export default MapaTeste02;
