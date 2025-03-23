// Enhanced mock data with professional meeting content
export const mockMeetingData = {
  title: "Advanced Air Mobility: Webinar",
  duration: "00:12:49",
  summary: "This final webinar of the NAA’s supply chain transition program provided an overview of the advanced air mobility (AAM) sector, covering both passenger/cargo aircraft and drone applications. Clyde discussed market forecasts, certification delays, infrastructure challenges, and diverse use cases—from urban transit to emergency services—highlighting the sector’s potential economic impact. The session concluded with an invitation for further questions and resource sharing.",
  action_points: [
      "Distribute the webinar recording and slides to all attendees.",
      "Share the UK drone industry resource and PwC market report details.",
      "Gather and follow up on any questions raised during the session.",
      "Monitor and communicate updates on BVLOS regulation from the CAA.",
      "Reach out to potential supply chain stakeholders in the advanced air mobility sector.",
      "Compile key market forecasts and certification challenges for internal review.",
  ],
  speakers: ["James Wilson", "Sarah Chen", "Michael Thompson", "Emma Rodriguez"],
  transcription: `For the Supply Chain Transition Program—which is a public program that the NAA has been running since May last year—it has funded a series of webinars around the aerospace industry, also covering space and, as you see today, enhanced air mobility. This program comes to an end at the end of March, so this is actually the last webinar in that series. I am very pleased that Clyde is able to run this again. It is the second time he has given us this webinar because it has been quite popular. I will now hand over to Clyde to introduce himself and take us through an introduction to AAM.
  
Clyde:
Afternoon, everybody. It is good to see so many people joining. I will give you a brief introduction to the advanced air mobility sector, which will include both passenger-carrying aircraft and non-passenger carrying drones. If you have any questions, feel free to raise your hand as we go along or ask them at the end. There may be some questions we want to address after the call if they are more involved.
We have just a few more people joining. I hesitated at the beginning and received a note asking if I wanted to include some additional instructions for those who have just joined. I can sort those people out in the background if needed.
As you know, there is a lot of interest in the advanced air mobility sector. You are probably here because you want to understand if the products or services you provide could succeed within it. There is a broad range of opportunities, so let us take a look at what we are discussing today.
The market scope includes passenger-carrying advanced air mobility vehicles—these are disruptive, electric, hybrid-electric, or hydrogen-powered vertical takeoff and landing aircraft, as well as short takeoff and landing or conventional aircraft that can also carry cargo. It is not just about electric vertical takeoff and landing aircraft; it also includes those that look more conventional but are powered differently, and even unmanned aircraft designed to fly without any people onboard.
Let us first consider the larger passenger and cargo-carrying advanced air mobility aircraft. In terms of market growth, high growth is expected but remains very uncertain. In 2022, I prepared a report for ADS, the National Trade Association for Aerospace, where we found many public sources predicting extremely high market values. The grey-shaded area in the chart shows the range of those forecasts. There is significant uncertainty because this is not yet an established market. If we average out the various forecasts, we predict a global market value of about 510 billion pounds for all the tickets sold and the aircraft by 2040. However, as we approach commercial operations, delays in certification and operation mean that the true emergence of this market is uncertain—though growth is expected, with potential for autonomous operations and big data to enhance ride-sharing and operational efficiency.
Regarding urban congestion, transport currently contributes about one-quarter of CO2 emissions. As air transport becomes more decarbonized, reducing emissions will be a high priority. There are now over a thousand advanced air mobility aircraft in development, although only a few have moved beyond the concept stage into prototyping and certification. Leaders like Joby, Vertical, and Archer have built production facilities and are heading toward production, but picking the winners is crucial as many programs will never reach commercial operation.
There are several use cases. One is urban transit—serving dense, high-transit routes like from an airport to a city. In some cities, like London, it might be hard to compete with existing systems such as the underground or rail links, but in other cities with busy airports and less-developed links, a shuttle service for up to 19 passengers could work. However, urban point-to-point travel is challenging in terms of safety, certification, and commercial viability given the short distances and infrastructure requirements.
Another viable case is the St. Winkendall transport scenario, which could use vertical takeoff and landing or short/conventional takeoff aircraft powered by alternative energy. For example, in the UK, a company called Zero Abia in Kemble is developing a fuel-cell-powered transmission system for X-Wing aircraft. They have successfully flown it, and there is already a network of aircraft operating on these routes at a lower cost.
There is also the market for high-net-worth individuals—personal transport that offers better bragging rights than a Ferrari, almost like a lower-cost helicopter. Emergency services have significant use cases as well, such as replacing air ambulances or police helicopters. A major challenge for electrically powered aircraft is endurance, as they currently cannot fly as long as traditional helicopters, which can cost around 1,200 pounds per hour. Reducing these costs would be very attractive.
In terms of the value chain, on the hardware side we have the aircraft components, and on the operations side, the necessary infrastructure, air traffic management, and overall airline-style services. In advanced air mobility, the value is skewed more toward operations and services, with only about 20 percent of the value in the aircraft itself compared to about 40 percent in conventional air transport.
Moving on to drones, there are three main use cases: surveying and inspection, emergency response, and cargo delivery. Drones can cover large areas, build topographical maps, assess flood risks, and inspect buildings without needing to send someone up at height. For instance, I am working on a project where I will be conducting a LiDAR survey of a canal bank that is difficult to access due to overgrowth and subsidence. Drones are also useful in emergency response—providing aerial views during floods or helping police locate missing people. Regarding delivery, while last-mile delivery (such as pizza or coffee to your front lawn) has social challenges, middle-mile delivery for remote locations—for example, transporting medicines or radioactive isotopes with a short half-life—is very promising.
A PwC report estimated that the advanced air mobility sector could contribute around 45 billion pounds to the UK economy by 2030, significantly reduce carbon emissions, and support up to 900,000 drones in commercial service by that time.
Currently, one limitation with drones is that they must be flown within the operator’s line of sight (up to 500 meters). However, the CAA is working on new regulations to allow operations beyond visual line of sight (BVLOS), with some exceptions already being permitted. By 2028, BVLOS operations should become much more routine, opening up many new use cases—such as a drone in a box service, where a drone on a rooftop can be deployed on demand for tasks like traffic or building surveys, all operated remotely.
Globally, drone production is dominated by DJI from China, which accounts for about 78 percent of production by volume. Competitors include Harrod in France and several US companies. The drone supply chain is fragmented and consists largely of SMEs, with only a few larger players in the military sector. For example, a UK company called Moloid, which was performing well before the Ukraine conflict, has been supplying drones to Ukraine and was recently acquired by BAE. There is a useful resource that maps the UK drone industry to help identify potential supply chain opportunities.
That is all I wanted to cover as a high-level introduction to advanced air mobility. If you have any specific questions, please raise your hand or type them in the chat, and we can address them now or after the session.
I will now send around the PDF of the slides to everyone who joined. Please feel free to reach out if you have further questions. Thank you for your time and expertise, and thank you, everyone, for attending. I hope it has been useful. Have a good day, everyone.`
};
// Create a complete job data object with timestamp
export const createMockJobData = () => {
    return {
        status: "complete",
        job_id: `mock-${Date.now()}`,
        minutes: mockMeetingData,
        timestamp: new Date().toISOString()
    };
};
// Initialize localStorage with mock data - run immediately
(() => {
    try {
        console.log('Checking for existing data in localStorage...');
        const existingJobId = localStorage.getItem('lastJobId');
        const existingJobData = localStorage.getItem('lastJobData');
        // Always create fresh mock data if missing or invalid
        if (!existingJobId || !existingJobData) {
            console.log('No valid data found, initializing with mock data');
            const mockData = createMockJobData();
            localStorage.setItem('lastJobId', mockData.job_id);
            localStorage.setItem('lastJobData', JSON.stringify(mockData));
            console.log('Mock data initialized:', mockData);
        }
        else {
            console.log('Found existing data in localStorage');
        }
    }
    catch (error) {
        console.error('Error initializing mock data:', error);
    }
})();
