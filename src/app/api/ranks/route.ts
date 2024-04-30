
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai'


export async function POST(request: Request) {

  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY
  });
  // return NextResponse.json([
  //   {
  //     "companyName": {
  //       "index": 0,
  //       "content": "Carbon"
  //     },
  //     "role": {
  //       "index": 22,
  //       "content": "Google Summer of Code Contributor"
  //     },
  //     "rating": {
  //       "index": 63,
  //       "content": "5/10",
  //       "numerator": 5
  //     },
  //     "reason": {
  //       "index": 77,
  //       "content": "Although the experience of working on a new programming language and creating faster patterns for it is valuable, it may not be directly related to the requirements listed in the job description. Additionally, Carbon is not a well-known company in comparison to Spotify."
  //     }
  //   },
  //   {
  //     "companyName": {
  //       "index": 358,
  //       "content": "RunwayML"
  //     },
  //     "role": {
  //       "index": 382,
  //       "content": "SWE Intern"
  //     },
  //     "rating": {
  //       "index": 400,
  //       "content": "6/10",
  //       "numerator": 6
  //     },
  //     "reason": {
  //       "index": 414,
  //       "content": "While the experience of migrating an API and increasing uptime, and using cryptography algorithms to create a useful waitlist are beneficial, the skills and experiences are not directly in line with the job description for a Spotify Web Engineer. However, working with OpenAI's Davinci model may show some potential for similar work in data exploration with Spotify. RunwayML is not a well known company compared to Spotify."
  //     }
  //   }
  // ])
  const openai = new OpenAIApi(configuration);
  const { experiences, job } = await request.json();
  let experiencesPrompt = '';
  for(const exp of experiences) {
    experiencesPrompt += `Company: ${exp.company} \n Role: ${exp.position} \n ${exp.description} \n \n`;
  }


  const convo = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", 
        content: "You are a helpful assistant." 
      },
      { role: "user", 
        content: "I will give you a job description (that includes company name and position) and a list of experiences. Each experience will have the company name and the job position as well. I want you to rate each experience based on what's given in the job description and the positions and influence of the companies of the experiences and the job description." 
      },
      {
        role: "user",
        content: job // "Job Description: The Freemium R&D team oversees the entire user journey on Spotify and ensures we engage with people in innovative ways, every step of the way. Our team grows Spotify’s audience by finding future listeners around the world and delivering the right value to them, at the right time. With research, product development, product design, engineering, and marketing all collaborating in one organization, we’re able to quickly create meaningful features and services for millions of people around the world, resulting in joyful, long-lasting relationships with Spotify. We strive to grow Spotify’s user base through organic search traffic. As part of our team, you will help us to accomplish this by crafting technical foundations and implementing new content experiences. As a growth product team, we proactively seek opportunities to drive monthly active users (MAU) by rewarding our users' attention, bringing awareness and engagement with our brand. We use experimentation to build outstanding technical solutions backed by data. Engineers work closely with user researchers, data scientists, and designers to explore opportunities related to specific cultures, regions, or markets. We are looking for a Web Engineer to Join The Band as a Summer Intern to help build web properties that millions of people use every single day to discover and listen to music, podcasts, and audiobooks. You will join an impactful team, continuously improving our engineering practices, delivering innovative technology while keeping it fun. Above all, your work will impact the way the world experiences audio. What you'll do: Work across the entire web stack, with modern web technologies (Typescript, GraphQL, Node.js, React, and Next.js) and cloud platforms (GKE) Build top-of-funnel user experiences to drive MAU and organic traffic. Work with data scientists, user researchers, designers, and other engineers to build A/B tests that influence the future of Spotify. Work in an environment that supports your individual learning and growth through mentorship and coaching. Who you are: You are pursuing a Bachelor’s degree or a boot camp certification in Computer Science or Computer Engineering or a related field of study. You have a graduation date of 2023 or 2024. You currently have valid work authorization to work in the country in which this role is based that will extend from June to August 2023. You have experience building user-friendly, data-rich JavaScript/HTML/CSS applications. You have some knowledge of React and/or TypeScript. You follow current and emerging trends of the web platform. You have experience with modern JavaScript coding, testing, debugging, and automation techniques. You are interested in web technologies, exploring data, user experience, design, and music. You can tell us about projects you’ve worked on that have involved your frontend or web work. You have analytical and problem-solving skills, and can communicate your idea. Where you'll be: We are a distributed workforce enabling our band members to find a work mode that is best for them! Where in the world? For this role, it can be within the Americas region in which we have a work location. Prefer an office to work from home instead? Not a problem! We have plenty of options for your working preferences. Find more information about our Work From Anywhere options here. Working hours? We operate within the Eastern Standard time zone for collaboration. Our paid summer internships last for 10-12 weeks and start at the beginning of June. The last day to apply is April 24th, 2023 at 11 AM EST. The United States hourly rate for this position is 33.00 USD (Undergraduate First Year & Sophomores), 42.00 USD (Undergraduate Juniors & Seniors), 49.00 USD (Masters) & 58.00 USD (PhD) per hour plus a one time intern stipend of 2,253 USD. This position is overtime eligible. These rates may be modified in the future. Spotify is an equal opportunity employer. You are welcome at Spotify for who you are, no matter where you come from, what you look like, or what’s playing in your headphones. Our platform is for everyone, and so is our workplace. The more voices we have represented and amplified in our business, the more we will all thrive, contribute, and be forward-thinking! So bring us your personal experience, your perspectives, and your background. It’s in our differences that we will find the power to keep revolutionizing the way the world listens. Spotify transformed music listening forever when we launched in 2008. Our mission is to unlock the potential of human creativity by giving a million creative artists the opportunity to live off their art and billions of fans the chance to enjoy and be passionate about these creators. Everything we do is driven by our love for music and podcasting. Today, we are the world’s most popular audio streaming subscription service."
      },
      {
        role: "user",
        content: experiencesPrompt // "Company: Carbon \n Role: Google Summer of Code Contributor \n Made pattern matching for Carbon lang which is a new language by Google to replace C++. Pattern matching was much faster than the alternative. Worked on the language parser, made faster by 35%. Made type system nicer by removing boilerplate for generics and templating. \n \n Company: RunwayML \n Role: SWE Intern \n Migrated API from servers to edge functions, increased uptime by 12%. Stable diffusion images to generate profile pictures based on random prompts given by OpenAI's Davinci model.  Used cryptography algorithms to create a self-sustaining waitlist that was used by over 100,000 users. "
      },
      {
        role: "user",
        content: "Please keep your answers in the following format: \n Comapany Name: [Company Name] \n Role: [role name] \n Rating: [rating out of 10] \n Reason: [reason]"
      }
    ]
  })
  if(convo?.status >= 400) {
    return new Response('Nitai!')
  }
  // const res = {
  //   "id": "chatcmpl-78mrry5YKoHCcRsSZebatLMiasSzM",
  //   "object": "chat.completion",
  //   "created": 1682328827,
  //   "model": "gpt-3.5-turbo-0301",
  //   "usage": {
  //     "prompt_tokens": 1256,
  //     "completion_tokens": 168,
  //     "total_tokens": 1424
  //   },
  //   "choices": [
  //     {
  //       "message": {
  //         "role": "assistant",
  //         "content": "Company Name: Carbon \nRole: Google Summer of Code Contributor \nRating: 7/10 \nReason: The experience in developing pattern matching for Carbon lang is valuable as it shows that the candidate has experience in working with programming languages and has a deep understanding of how they work. Additionally, the experience in optimizing the language parser and type system will be useful for implementing and modifying features in the Spotify platform. \n\nCompany Name: RunwayML \nRole: SWE Intern \nRating: 6/10 \nReason: The experience in improving API stability through edge functions and using cryptography algorithms is relevant to the Spotify job description. However, the experience in generating profile pictures based on random prompts is less directly relevant to the job description. Overall, the experience in working with APIs and implementing innovative solutions will be a valuable asset for the Spotify team."
  //       },
  //       "finish_reason": "stop",
  //       "index": 0
  //     }
  //   ]
  // }

  console.log("--VISHVAMBARA--")
  console.log(convo.data.choices[0].message?.content)
  // return NextResponse.json(convo.data)
  const res = convo.data
// const res = {
//   "id": "chatcmpl-78n7y87MLN5uMKDwSL3aSJv4n8Ilx",
//   "object": "chat.completion",
//   "created": 1682329826,
//   "model": "gpt-3.5-turbo-0301",
//   "usage": {
//     "prompt_tokens": 1256,
//     "completion_tokens": 182,
//     "total_tokens": 1438
//   },
//   "choices": [
//     {
//       "message": {
//         "role": "assistant",
//         "content": "Company Name: Carbon \nRole: Google Summer of Code Contributor \nRating: 7 \nReason: The experience is relevant as it involves technical skills related to programming languages such as pattern matching, parsers, and types. Additionally, the experience is related to creating solutions that involve designing and improving programming language features, which aligns with the job description. However, Carbon is not as established as Spotify which could bring down the rating.\n\nCompany Name: RunwayML \nRole: SWE Intern \nRating: 8 \nReason: The experience is relevant as it involves technical skills related to API migration, cryptography, and image generation. The experience also involves addressing issues related to uptime and reliability, which aligns with the job description. The fact that the experience was used by a large number of users is also impressive. However, RunwayML is not as established as Spotify, which could bring down the rating slightly."
//       },
//       "finish_reason": "stop",
//       "index": 0
//     }
//   ]
// }
  try {
    const ans = res.choices[0].message?.content;
    if(!ans) {
      return NextResponse.json(null)
    }
    let mutableAns = ans.slice();
    const finRes = [];
    let start = 0;
    while(mutableAns.search("Reason:") !== -1) {
      let comp_index = mutableAns.search("Company Name:");
      let role_index = mutableAns.search("Role:");
      let rating_index = mutableAns.search("Rating:");
      let reason_index = mutableAns.search("Reason:");
      let next_comp_index = mutableAns.indexOf("Company Name:", comp_index + 1);

      const resObj = {
        companyName: {
          index: start + comp_index, 
          content: mutableAns.substring(comp_index, role_index).replace("Company Name: ", "").replace(' \n', '')
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
      console.log(resObj);
      finRes.push(resObj);
      mutableAns = mutableAns.slice(next_comp_index !== -1 ? next_comp_index : mutableAns.length);
      console.log(next_comp_index);
      console.log(mutableAns);
      start = next_comp_index;
    }
    for(const item of finRes) {
      item.rating.numerator = parseInt(item.rating.content[0])
    }

    return NextResponse.json(finRes);

  } catch(err) {

    console.error(err);
    return new Response("There was an error, Ramachandra ki Jai!")
  }
  
  // console.log(rama)
  // return new Response('Gauranga!')
}
