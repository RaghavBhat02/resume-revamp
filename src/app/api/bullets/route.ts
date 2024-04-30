
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai'

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}


export async function POST(request: Request) {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPEN_AI_KEY,
    });
    const openai = new OpenAIApi(configuration);
  
    const req = await request.json();
    let experiencesPrompt = '';
    for(const exp of req) {
      experiencesPrompt += `Company: ${exp.company} \n Role: ${exp.position} \n ${exp.description} \n \n`;
    }


    const convo = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", 
          content: "You are a helpful assistant." 
        },
        { role: "user", 
          content: "I will give you a list of experiences. Please turn each experience into 3 to 5 bullet points that follow the best guidelines for action oriented resume bullet points. Feel free to change the role if you think it can look better." 
        },
        {
          role: "user",
          content: experiencesPrompt // "Company: Carbon \n Role: Google Summer of Code Contributor \n Made pattern matching for Carbon lang which is a new language by Google to replace C++. Pattern matching was much faster than the alternative. Worked on the language parser, made faster by 35%. Made type system nicer by removing boilerplate for generics and templating. \n \n Company: RunwayML \n Role: SWE Intern \n Migrated API from servers to edge functions, increased uptime by 12%. Stable diffusion images to generate profile pictures based on random prompts given by OpenAI's Davinci model.  Used cryptography algorithms to create a self-sustaining waitlist that was used by over 100,000 users. "
        },
        {
          role: "user",
          content: "Please keep your answers in the following format: \n Comapany Name: [Company Name] \n Role: [role name] \n Points: [bullet points]"
        }
      ]
    })
    if(convo?.status >= 400) {
      return new Response('Nitai!')
    }
  
    const res = convo.data;
    // const res = {
    //   "id": "chatcmpl-7EUxq17S0Plp0otEtcVzmmaVdluZO",
    //   "object": "chat.completion",
    //   "created": 1683689974,
    //   "model": "gpt-3.5-turbo-0301",
    //   "usage": {
    //     "prompt_tokens": 249,
    //     "completion_tokens": 159,
    //     "total_tokens": 408
    //   },
    //   "choices": [
    //     {
    //       "message": {
    //         "role": "assistant",
    //         "content": "Company Name: Carbon \nRole: Google Summer of Code Contributor \nPoints: \n- Developed pattern matching for Carbon, a new language by Google designed to replace C++\n- Improved the speed of pattern matching, making it faster than the alternatives\n- Enhanced the language parser, resulting in a 35% speed increase\n- Streamlined the type system by reducing boilerplate for generics and templating\n \nCompany Name: RunwayML \nRole: SWE Intern \nPoints: \n- Migrated API from servers to edge functions, resulting in a 12% increase in uptime\n- Developed stable diffusion images to generate profile pictures based on random prompts provided by OpenAI's Davinci model\n- Implemented cryptography algorithms to create a self-sustaining waitlist used by 100,000+ users\n"
    //       },
    //       "finish_reason": "stop",
    //       "index": 0
    //     }
    //   ]
    // }
    const ans = res.choices[0].message?.content;
    if(!ans) return new Response("ERROR: No ans. POST /api/bullets")

    let mutableAns = ans.slice();
    let start = 0;
    let finRes = []
    while(mutableAns.search("Points:") !== -1) {
        let comp_index = mutableAns.search("Company Name:");
        let role_index = mutableAns.search("Role:");
        let points_index = mutableAns.search("Points:");
        let next_comp_index = mutableAns.indexOf("Company Name:", comp_index + 1);
        let dashes: number[] = []; 
        let dash_index = points_index;
        let dash: null | number = null;
        while(dash !== -1) {
          console.log(dash_index);
          console.log(next_comp_index)
          console.log(mutableAns.substring(dash_index + 1, next_comp_index !== -1 ? next_comp_index : mutableAns.length));
          dash = mutableAns.substring(dash_index + 1, next_comp_index !== -1 ? next_comp_index : mutableAns.length).indexOf('- ');
          dash_index = dash_index + 1 + dash;
          console.log(dash_index)
          if(dash !== -1) {
            dashes.push(dash_index);
          }
        }
          
        // console.log(dashes);
        // if(!dashes) return new Response("ERROR: No bullets. POST /api/bullets");
        const resObj = {
          companyName: {
            index: start + comp_index, 
            content: mutableAns.substring(comp_index, role_index).replace("Company Name: ", "").replace(' \n', '')
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
        console.log(resObj);
        finRes.push(resObj);
        mutableAns = mutableAns.slice(next_comp_index !== -1 ? next_comp_index : mutableAns.length);
        console.log(next_comp_index);
        console.log(mutableAns);
        start = next_comp_index;
      }
    return NextResponse.json(finRes);
  } catch(err) {
    console.error(err);
    return new Response("There was an error. Please contact support. POST /api/bullets")
  }
}
