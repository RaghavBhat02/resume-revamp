
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai'
import { CohereClient } from 'cohere-ai'

export async function POST(request: Request) {

  const cohere = new CohereClient({
    token: process.env.COHERE_KEY,
  });
  
  const { experiences, job } = await request.json();

  // Create text prompt
  let experiencesPrompt = '';
  for(const exp of experiences) {
    experiencesPrompt += `Company: ${exp.company} \n Role: ${exp.position} \n ${exp.description} \n \n`;
  }
  
  // Feed AI prompt
  const chatStream = await cohere.chatStream({
    chatHistory: [
      { role: 'SYSTEM', message: "You are a helpful resume reviewer. Remember that internships are a level below new grad and entry level roles."},
      { role: 'USER', 
        message: "I will give you a job description (that includes company name and position) and a list of experiences. Each experience will have the company name and the job position as well. I want you to rate each experience based on what's given in the job description and the positions and influence of the companies of the experiences and the job description." 
      },
      {
        role: "USER",
        message: job // "Job Description: The Freemium R&D team oversees the entire user journey on Spotify and ensures we engage with people in innovative ways, every step of the way. Our team grows Spotify’s audience by finding future listeners around the world and delivering the right value to them, at the right time. With research, product development, product design, engineering, and marketing all collaborating in one organization, we’re able to quickly create meaningful features and services for millions of people around the world, resulting in joyful, long-lasting relationships with Spotify. We strive to grow Spotify’s user base through organic search traffic. As part of our team, you will help us to accomplish this by crafting technical foundations and implementing new content experiences. As a growth product team, we proactively seek opportunities to drive monthly active users (MAU) by rewarding our users' attention, bringing awareness and engagement with our brand. We use experimentation to build outstanding technical solutions backed by data. Engineers work closely with user researchers, data scientists, and designers to explore opportunities related to specific cultures, regions, or markets. We are looking for a Web Engineer to Join The Band as a Summer Intern to help build web properties that millions of people use every single day to discover and listen to music, podcasts, and audiobooks. You will join an impactful team, continuously improving our engineering practices, delivering innovative technology while keeping it fun. Above all, your work will impact the way the world experiences audio. What you'll do: Work across the entire web stack, with modern web technologies (Typescript, GraphQL, Node.js, React, and Next.js) and cloud platforms (GKE) Build top-of-funnel user experiences to drive MAU and organic traffic. Work with data scientists, user researchers, designers, and other engineers to build A/B tests that influence the future of Spotify. Work in an environment that supports your individual learning and growth through mentorship and coaching. Who you are: You are pursuing a Bachelor’s degree or a boot camp certification in Computer Science or Computer Engineering or a related field of study. You have a graduation date of 2023 or 2024. You currently have valid work authorization to work in the country in which this role is based that will extend from June to August 2023. You have experience building user-friendly, data-rich JavaScript/HTML/CSS applications. You have some knowledge of React and/or TypeScript. You follow current and emerging trends of the web platform. You have experience with modern JavaScript coding, testing, debugging, and automation techniques. You are interested in web technologies, exploring data, user experience, design, and music. You can tell us about projects you’ve worked on that have involved your frontend or web work. You have analytical and problem-solving skills, and can communicate your idea. Where you'll be: We are a distributed workforce enabling our band members to find a work mode that is best for them! Where in the world? For this role, it can be within the Americas region in which we have a work location. Prefer an office to work from home instead? Not a problem! We have plenty of options for your working preferences. Find more information about our Work From Anywhere options here. Working hours? We operate within the Eastern Standard time zone for collaboration. Our paid summer internships last for 10-12 weeks and start at the beginning of June. The last day to apply is April 24th, 2023 at 11 AM EST. The United States hourly rate for this position is 33.00 USD (Undergraduate First Year & Sophomores), 42.00 USD (Undergraduate Juniors & Seniors), 49.00 USD (Masters) & 58.00 USD (PhD) per hour plus a one time intern stipend of 2,253 USD. This position is overtime eligible. These rates may be modified in the future. Spotify is an equal opportunity employer. You are welcome at Spotify for who you are, no matter where you come from, what you look like, or what’s playing in your headphones. Our platform is for everyone, and so is our workplace. The more voices we have represented and amplified in our business, the more we will all thrive, contribute, and be forward-thinking! So bring us your personal experience, your perspectives, and your background. It’s in our differences that we will find the power to keep revolutionizing the way the world listens. Spotify transformed music listening forever when we launched in 2008. Our mission is to unlock the potential of human creativity by giving a million creative artists the opportunity to live off their art and billions of fans the chance to enjoy and be passionate about these creators. Everything we do is driven by our love for music and podcasting. Today, we are the world’s most popular audio streaming subscription service."
      },
      {
        role: "USER",
        message: experiencesPrompt // "Company: Carbon \n Role: Google Summer of Code Contributor \n Made pattern matching for Carbon lang which is a new language by Google to replace C++. Pattern matching was much faster than the alternative. Worked on the language parser, made faster by 35%. Made type system nicer by removing boilerplate for generics and templating. \n \n Company: RunwayML \n Role: SWE Intern \n Migrated API from servers to edge functions, increased uptime by 12%. Stable diffusion images to generate profile pictures based on random prompts given by OpenAI's Davinci model.  Used cryptography algorithms to create a self-sustaining waitlist that was used by over 100,000 users. "
      },
    ],
    message: "Please keep your answers in the following format: \n Company: [Company Name] \n Role: [role name] \n Rating: [rating out of 10] \n Reason: [reason]",
    connectors: [],
  });
  let cohere_message = ''

  // concatenate streamed response from AI
  for await (const message of chatStream) {
    if (message.eventType === 'text-generation') {
      cohere_message += message.text;
    }
  }
  console.log("AI message: ", cohere_message)

  
  try {
    const ans = cohere_message;
    if(!ans) {
      return NextResponse.json(null)
    }
    // Parse response 

    let mutableAns = ans.slice();
    const finRes = [];
    let start = 0;

    while(mutableAns.search("Reason:") !== -1) {
      let comp_index = mutableAns.search("Company: ");
      let role_index = mutableAns.search("Role:");
      let rating_index = mutableAns.search("Rating:");
      let reason_index = mutableAns.search("Reason:");
      let next_comp_index = mutableAns.indexOf("Company: ", comp_index + 1);

      const resObj = {
        companyName: {
          index: start + comp_index, 
          content: mutableAns.substring(comp_index, role_index).replace("Company: ", "").replace(' \n', '')
        },
        role: {
          index: start + role_index,
          content: mutableAns.substring(role_index, rating_index).replace("Role: ", "").replace(' \n', ''),
        },
        rating: {
          index: start + rating_index, 
          content: mutableAns.substring(rating_index, reason_index).replace("Rating: ", "").replace(' \n', ''),
          numerator: -1
        },
        reason: {
          index: start + reason_index,
          content: mutableAns.substring(reason_index, next_comp_index !== -1 ? next_comp_index : mutableAns.length).replace("Reason: ","").replace(' \n\n', '').replace('\n\n', '')
        }
      }
      finRes.push(resObj);
      mutableAns = mutableAns.slice(next_comp_index !== -1 ? next_comp_index : mutableAns.length);
      start = next_comp_index;
    }
    
    // Get rating number from the content, Ex: 7/10 -> 7
    for(const item of finRes) {
      item.rating.numerator = parseInt(item.rating.content[0])
    }

    return NextResponse.json(finRes);

  } catch(err) {

    console.error(err);
    return new Response("There was an error, please contact support", {status: 500 })
  }
  
}
