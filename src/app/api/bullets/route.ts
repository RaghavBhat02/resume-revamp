
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai'
import { CohereClient } from 'cohere-ai';
function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}


export async function POST(request: Request) {
  try {
 
    const cohere = new CohereClient({
      token: process.env.COHERE_KEY,
    });
      
    const req = await request.json();
    let experiencesPrompt = '';
    for(const exp of req) {
      experiencesPrompt += `Company: ${exp.company} \n Role: ${exp.position} \n ${exp.description} \n \n`;
    }


    const chatStream = await cohere.chatStream({
      chatHistory: [
        { role: "SYSTEM", 
          message: "You are a helpful assistant." 
        },
        { role: "USER", 
          message: "I will give you a list of experiences. Please turn each experience into 3 to 5 bullet points that follow the best guidelines for action oriented resume bullet points. Feel free to change the role if you think it can look better." 
        },
        {
          role: "USER",
          message: experiencesPrompt // "Company: Carbon \n Role: Google Summer of Code Contributor \n Made pattern matching for Carbon lang which is a new language by Google to replace C++. Pattern matching was much faster than the alternative. Worked on the language parser, made faster by 35%. Made type system nicer by removing boilerplate for generics and templating. \n \n Company: RunwayML \n Role: SWE Intern \n Migrated API from servers to edge functions, increased uptime by 12%. Stable diffusion images to generate profile pictures based on random prompts given by OpenAI's Davinci model.  Used cryptography algorithms to create a self-sustaining waitlist that was used by over 100,000 users. "
        }
      ],
      message: "Please keep your answers in the following format: \n Comapany: [Company Name] \n Role: [role name] \n Points: [bullet points]"
    })

    let cohere_message = ''
    for await (const message of chatStream) {
      if (message.eventType === 'text-generation') {
        cohere_message += message.text;
      }
    }
    console.log(cohere_message)

    const ans = cohere_message;
    if(!ans) return new Response("ERROR: No ans. POST /api/bullets")

    let mutableAns = ans.slice();
    let start = 0;
    let finRes = []
    while(mutableAns.search("Points:") !== -1) {
        let comp_index = mutableAns.search("Company:");
        let role_index = mutableAns.search("Role:");
        let points_index = mutableAns.search("Points:");
        let next_comp_index = mutableAns.indexOf("Company:", comp_index + 1);
        let dashes: number[] = []; 
        let dash_index = points_index;
        let dash: null | number = null;
        while(dash !== -1) {
        
          dash = mutableAns.substring(dash_index + 1, next_comp_index !== -1 ? next_comp_index : mutableAns.length).indexOf('- ');
          dash_index = dash_index + 1 + dash;

          if(dash !== -1) {
            dashes.push(dash_index);
          }
        }
          
        const resObj = {
          companyName: {
            index: start + comp_index, 
            content: mutableAns.substring(comp_index, role_index).replace("Company: ", "").replace(' \n', '')
          },
          role: {
            index: start + role_index,
            content: mutableAns.substring(role_index, points_index).replace("Role: ", "").replace(' \n', ''),
          },
          points: {
            index: start + points_index,
            bullets: (dashes).map((dash_idx, i) => ({
              index: start + dash_idx,
              content: mutableAns.substring(dash_idx, (dashes[i + 1] ?? (next_comp_index !== -1 ? next_comp_index : mutableAns.length))).replace(' \n', '').replace('\n', '').replace('- ', '')
            }))
          }
        }

        finRes.push(resObj);
        mutableAns = mutableAns.slice(next_comp_index !== -1 ? next_comp_index : mutableAns.length);

        start = next_comp_index;
    }

    console.log(finRes)
    return NextResponse.json(finRes);
  } catch(err) {
    console.error(err);
    return new Response("There was an error. Please contact support. POST /api/bullets", { status: 500 })
  }
}
