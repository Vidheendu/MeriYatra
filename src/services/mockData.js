export const dummyRoutes = [
  {
    id: 'R-1',
    name: 'Bhopal - Indore Intercity',
    stops: ['Bhopal ISBT', 'Sehore Bypass', 'Ashta Bus Stand', 'Dewas', 'Indore AICTSL'],
    busesAssigned: ['MP04-BUS-92', 'MP09-BUS-94'],
  },
  {
    id: 'R-2',
    name: 'VIT Campus Local Shuttle',
    stops: ['Sehore City', 'Kothri Kalan', 'VIT Bhopal Campus', 'Ashta Bus Stand'],
    busesAssigned: ['MP04-AUTO-91'],
  },
  {
    id: 'R-3',
    name: 'Ujjain Pilgrimage Route',
    stops: ['Indore', 'Sanwer', 'Ujjain Nanakheda', 'Ujjain Mahakal Mandir'],
    busesAssigned: ['MP09-AUTO-93'],
  },
  {
    id: 'R-4',
    name: 'Bhopal City Express',
    stops: ['Bairagarh', 'Lalghati', 'Nadira Bus Stand', 'MP Nagar', 'Habibganj / Rani Kamlapati'],
    busesAssigned: ['MP04-BUS-11', 'MP04-AUTO-22'],
  }
];

export const dummyBuses = [
  { id: 'BUS-101', routeId: 'R-2', route: 'VIT Campus Local Shuttle', status: 'On Time', eta: '5 min', occupancy: 'Low', lat: 23.0780, lng: 76.8520 }
];
