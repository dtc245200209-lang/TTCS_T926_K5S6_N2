import {useEffect,useState} from 'react';
import {get,post,patch} from './api';

type Job={id:number;title:string;department:string;location:string;salaryRange:string;status:string};
type Candidate={id:number;fullName:string;email:string;phone:string};
type Application={id:number;stage:string;job:Job;candidate:Candidate};

const stages=['NEW','SCREENING','INTERVIEW','OFFER','HIRED','REJECTED'];

export default function App(){
  const [tab,setTab]=useState('dashboard');
  const [jobs,setJobs]=useState<Job[]>([]);
  const [candidates,setCandidates]=useState<Candidate[]>([]);
  const [apps,setApps]=useState<Application[]>([]);
  const [health,setHealth]=useState('Đang kiểm tra...');

  async function load(){
    try{
      const [j,c,a,h]=await Promise.all([
        get<Job[]>('/jobs'),get<Candidate[]>('/candidates'),get<Application[]>('/applications'),get<{status:string}>('/health')
      ]);
      setJobs(j);setCandidates(c);setApps(a);setHealth(h.status);
    }catch(e){setHealth('OFFLINE');}
  }
  useEffect(()=>{load()},[]);

  async function addJob(){
    const title=prompt('Tên vị trí tuyển dụng?'); if(!title)return;
    await post('/jobs',{title,department:'Công nghệ',location:'Hà Nội',salaryRange:'15.000.000 - 25.000.000 VND',status:'DRAFT'});
    load();
  }
  async function addCandidate(){
    const name=prompt('Họ tên ứng viên?'); if(!name)return;
    const email=prompt('Email?')||'';
    await post('/candidates',{fullName:name,email,phone:'',cvUrl:''});load();
  }
  async function move(id:number){
    const current=apps.find(a=>a.id===id);if(!current)return;
    const idx=stages.indexOf(current.stage);const next=stages[Math.min(idx+1,stages.length-1)];
    await patch(`/applications/${id}/stage?value=${next}`);load();
  }

  return <div className="app">
    <header><div><h1>ATS Recruitment</h1><span>Hệ thống quản lý tuyển dụng nội bộ</span></div><div className="health">Server: <b>{health}</b></div></header>
    <div className="layout">
      <aside>
        {['dashboard','jobs','candidates','pipeline'].map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)}>{x==='dashboard'?'📊 Tổng quan':x==='jobs'?'💼 Vị trí tuyển dụng':x==='candidates'?'👤 Ứng viên':'📋 Pipeline'}</button>)}
      </aside>
      <main>
        {tab==='dashboard' && <><h2>Tổng quan tuyển dụng</h2><div className="cards">
          <div><b>{jobs.length}</b><span>Vị trí</span></div><div><b>{candidates.length}</b><span>Ứng viên</span></div><div><b>{apps.length}</b><span>Hồ sơ ứng tuyển</span></div><div><b>{apps.filter(a=>a.stage==='HIRED').length}</b><span>Đã nhận việc</span></div>
        </div><section><h3>Luồng nghiệp vụ</h3><p>Yêu cầu → Duyệt → Đăng tin → Ứng tuyển → Sàng lọc → Phỏng vấn → Offer → Nhận việc</p></section></>}
        {tab==='jobs' && <><div className="titleRow"><h2>Vị trí tuyển dụng</h2><button onClick={addJob}>+ Tạo vị trí</button></div><table><thead><tr><th>Vị trí</th><th>Phòng ban</th><th>Địa điểm</th><th>Lương</th><th>Trạng thái</th></tr></thead><tbody>{jobs.map(j=><tr><td>{j.title}</td><td>{j.department}</td><td>{j.location}</td><td>{j.salaryRange}</td><td><span className="tag">{j.status}</span></td></tr>)}</tbody></table></>}
        {tab==='candidates' && <><div className="titleRow"><h2>Ứng viên</h2><button onClick={addCandidate}>+ Thêm ứng viên</button></div><table><thead><tr><th>Họ tên</th><th>Email</th><th>Số điện thoại</th></tr></thead><tbody>{candidates.map(c=><tr><td>{c.fullName}</td><td>{c.email}</td><td>{c.phone}</td></tr>)}</tbody></table></>}
        {tab==='pipeline' && <><h2>Pipeline tuyển dụng</h2><div className="pipeline">{stages.map(s=><div className="column"><h3>{s}</h3>{apps.filter(a=>a.stage===s).map(a=><div className="candidate"><b>{a.candidate.fullName}</b><small>{a.job.title}</small>{s!=='HIRED'&&s!=='REJECTED'&&<button onClick={()=>move(a.id)}>Chuyển bước →</button>}</div>)}</div>)}</div></>}
      </main>
    </div>
  </div>
}
