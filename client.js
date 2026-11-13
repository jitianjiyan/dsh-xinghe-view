window.__ModuleLoader__.load({
  id: 'dsh-xinghe-view',
  factory(require) {
    const React = require('react');
    const { useState, useEffect, useMemo, useRef, useCallback } = React;
    const h = React.createElement;

    const NS = 'xinghe-view';
    const PANEL_ID = 'xinghe-view';
    const STORE_KEY = 'xinghe-view.links.v1';
    const MODE_KEY = 'xinghe-view.mode.v1';
    /* 宿主把插件包的 ./assets/* 挂在 /plugins/<包名>/assets/ 下，免鉴权、长缓存。 */
    const ASSET_BASE = '/plugins/dsh-xinghe-view/assets/';
    const STAR_SPRITES = [0, 1, 2, 3].map((i) => ASSET_BASE + 's' + i + '.png');
    const PLANET_SPRITES = Array.from({ length: 10 }, (_, i) => ASSET_BASE + 'p' + i + '.png');

    /* 空闲时预热贴图：进面板时不必等解码，首帧快一截。 */
    const warmSprites = () => {
      for (const src of STAR_SPRITES.concat(PLANET_SPRITES)) {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      }
    };
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(warmSprites, { timeout: 4000 });
    else window.setTimeout(warmSprites, 1500);

    /* ---------------------------------------------------------------- pinyin */
    const PY = {"啊":"a","阿":"a","埃":"ai","挨":"ai","哎":"ai","唉":"ai","哀":"ai","皑":"ai","癌":"ai","蔼":"ai","矮":"ai","艾":"ai","碍":"ai","爱":"ai","隘":"ai","鞍":"an","氨":"an","安":"an","俺":"an","按":"an","暗":"an","岸":"an","胺":"an","案":"an","肮":"ang","昂":"ang","盎":"ang","凹":"ao","敖":"ao","熬":"ao","翱":"ao","袄":"ao","傲":"ao","奥":"ao","懊":"ao","澳":"ao","芭":"ba","捌":"ba","扒":"ba","叭":"ba","吧":"ba","笆":"ba","八":"ba","疤":"ba","巴":"ba","拔":"ba","跋":"ba","靶":"ba","把":"ba","耙":"pa","坝":"ba","霸":"ba","罢":"ba","爸":"ba","白":"bai","柏":"bai","百":"bai","摆":"bai","佰":"bai","败":"bai","拜":"bai","稗":"bai","斑":"ban","班":"ban","搬":"ban","扳":"ban","般":"ban","颁":"ban","板":"ban","版":"ban","扮":"ban","拌":"ban","伴":"ban","瓣":"ban","半":"ban","办":"ban","绊":"ban","邦":"bang","帮":"bang","梆":"bang","榜":"bang","膀":"bang","绑":"bang","棒":"bang","磅":"bang","蚌":"bang","镑":"bang","傍":"bang","谤":"bang","苞":"bao","胞":"bao","包":"bao","褒":"bao","剥":"bao","薄":"bao","雹":"bao","保":"bao","堡":"bao","饱":"bao","宝":"bao","抱":"bao","报":"bao","暴":"bao","豹":"bao","鲍":"bao","爆":"bao","杯":"bei","碑":"bei","悲":"bei","卑":"bei","北":"bei","辈":"bei","背":"bei","贝":"bei","钡":"bei","倍":"bei","狈":"bei","备":"bei","惫":"bei","焙":"bei","被":"bei","奔":"ben","苯":"ben","本":"ben","笨":"ben","崩":"beng","绷":"beng","甭":"beng","泵":"beng","蹦":"beng","迸":"beng","逼":"bi","鼻":"bi","比":"bi","鄙":"bi","笔":"bi","彼":"bi","碧":"bi","蓖":"bi","蔽":"bi","毕":"bi","毙":"bi","毖":"bi","币":"bi","庇":"bi","痹":"bi","闭":"bi","敝":"bi","弊":"bi","必":"bi","辟":"pi","壁":"bi","臂":"bi","避":"bi","陛":"bi","鞭":"bian","边":"bian","编":"bian","贬":"bian","扁":"bian","便":"bian","变":"bian","卞":"bian","辨":"bian","辩":"bian","辫":"bian","遍":"bian","标":"biao","彪":"biao","膘":"biao","表":"biao","鳖":"bie","憋":"bie","别":"bie","瘪":"bie","彬":"bin","斌":"bin","濒":"bin","滨":"bin","宾":"bin","摈":"bin","兵":"bing","冰":"bing","柄":"bing","丙":"bing","秉":"bing","饼":"bing","炳":"bing","病":"bing","并":"bing","玻":"bo","菠":"bo","播":"bo","拨":"bo","钵":"bo","波":"bo","博":"bo","勃":"bo","搏":"bo","铂":"bo","箔":"bo","伯":"bo","帛":"bo","舶":"bo","脖":"bo","膊":"bo","渤":"bo","泊":"bo","驳":"bo","捕":"bu","卜":"bu","哺":"bu","补":"bu","埠":"bu","不":"bu","布":"bu","步":"bu","簿":"bo","部":"bu","怖":"bu","擦":"ca","猜":"cai","裁":"cai","材":"cai","才":"cai","财":"cai","睬":"cai","踩":"cai","采":"cai","彩":"cai","菜":"cai","蔡":"cai","餐":"can","参":"can","蚕":"can","残":"can","惭":"can","惨":"can","灿":"can","苍":"cang","舱":"cang","仓":"cang","沧":"cang","藏":"cang","操":"cao","糙":"cao","槽":"cao","曹":"cao","草":"cao","厕":"ce","策":"ce","侧":"ce","册":"ce","测":"ce","层":"ceng","蹭":"ceng","插":"cha","叉":"cha","茬":"cha","茶":"cha","查":"cha","碴":"cha","搽":"cha","察":"cha","岔":"cha","差":"cha","诧":"cha","拆":"chai","柴":"chai","豺":"chai","搀":"chan","掺":"chan","蝉":"chan","馋":"chan","谗":"chan","缠":"chan","铲":"chan","产":"chan","阐":"chan","颤":"chan","昌":"chang","猖":"chang","场":"chang","尝":"chang","常":"chang","长":"chang","偿":"chang","肠":"chang","厂":"chang","敞":"chang","畅":"chang","唱":"chang","倡":"chang","超":"chao","抄":"chao","钞":"chao","朝":"chao","嘲":"chao","潮":"chao","巢":"chao","吵":"chao","炒":"chao","车":"che","扯":"che","撤":"che","掣":"che","彻":"che","澈":"che","郴":"chen","臣":"chen","辰":"chen","尘":"chen","晨":"chen","忱":"chen","沉":"chen","陈":"chen","趁":"chen","衬":"chen","撑":"cheng","称":"cheng","城":"cheng","橙":"cheng","成":"cheng","呈":"cheng","乘":"cheng","程":"cheng","惩":"cheng","澄":"cheng","诚":"cheng","承":"cheng","逞":"cheng","骋":"cheng","秤":"cheng","吃":"chi","痴":"chi","持":"chi","匙":"chi","池":"chi","迟":"chi","弛":"chi","驰":"chi","耻":"chi","齿":"chi","侈":"chi","尺":"chi","赤":"chi","翅":"chi","斥":"chi","炽":"chi","充":"chong","冲":"chong","虫":"chong","崇":"chong","宠":"chong","抽":"chou","酬":"chou","畴":"chou","踌":"chou","稠":"chou","愁":"chou","筹":"chou","仇":"chou","绸":"chou","瞅":"chou","丑":"chou","臭":"chou","初":"chu","出":"chu","橱":"chu","厨":"chu","躇":"chu","锄":"chu","雏":"chu","滁":"chu","除":"chu","楚":"chu","础":"chu","储":"chu","矗":"chu","搐":"chu","触":"chu","处":"chu","揣":"chuai","川":"chuan","穿":"chuan","椽":"chuan","传":"chuan","船":"chuan","喘":"chuan","串":"chuan","疮":"chuang","窗":"chuang","幢":"zhuang","床":"chuang","闯":"chuang","创":"chuang","吹":"chui","炊":"chui","捶":"chui","锤":"chui","垂":"chui","春":"chun","椿":"chun","醇":"chun","唇":"chun","淳":"chun","纯":"chun","蠢":"chun","戳":"chuo","绰":"chuo","疵":"ci","茨":"ci","磁":"ci","雌":"ci","辞":"ci","慈":"ci","瓷":"ci","词":"ci","此":"ci","刺":"ci","赐":"ci","次":"ci","聪":"cong","葱":"cong","囱":"cong","匆":"cong","从":"cong","丛":"cong","凑":"cou","粗":"cu","醋":"cu","簇":"cu","促":"cu","蹿":"cuan","篡":"cuan","窜":"cuan","摧":"cui","崔":"cui","催":"cui","脆":"cui","瘁":"cui","粹":"cui","淬":"cui","翠":"cui","村":"cun","存":"cun","寸":"cun","磋":"cuo","撮":"cuo","搓":"cuo","措":"cuo","挫":"cuo","错":"cuo","搭":"da","达":"da","答":"da","瘩":"da","打":"da","大":"da","呆":"dai","歹":"dai","傣":"dai","戴":"dai","带":"dai","殆":"dai","代":"dai","贷":"dai","袋":"dai","待":"dai","逮":"dai","怠":"dai","耽":"dan","担":"dan","丹":"dan","单":"dan","郸":"dan","掸":"dan","胆":"dan","旦":"dan","氮":"dan","但":"dan","惮":"dan","淡":"dan","诞":"dan","弹":"tan","蛋":"dan","当":"dang","挡":"dang","党":"dang","荡":"dang","档":"dang","刀":"dao","捣":"dao","蹈":"dao","倒":"dao","岛":"dao","祷":"dao","导":"dao","到":"dao","稻":"dao","悼":"dao","道":"dao","盗":"dao","德":"de","得":"de","的":"de","蹬":"deng","灯":"deng","登":"deng","等":"deng","瞪":"deng","凳":"deng","邓":"deng","堤":"di","低":"di","滴":"di","迪":"di","敌":"di","笛":"di","狄":"di","涤":"di","翟":"zhai","嫡":"di","抵":"di","底":"di","地":"di","蒂":"di","第":"di","帝":"di","弟":"di","递":"di","缔":"di","颠":"dian","掂":"dian","滇":"dian","碘":"dian","点":"dian","典":"dian","靛":"dian","垫":"dian","电":"dian","佃":"dian","甸":"dian","店":"dian","惦":"dian","奠":"dian","淀":"dian","殿":"dian","碉":"diao","叼":"diao","雕":"diao","凋":"diao","刁":"diao","掉":"diao","吊":"diao","钓":"diao","调":"tiao","跌":"die","爹":"die","碟":"die","蝶":"die","迭":"die","谍":"die","叠":"die","丁":"ding","盯":"ding","叮":"ding","钉":"ding","顶":"ding","鼎":"ding","锭":"ding","定":"ding","订":"ding","丢":"diu","东":"dong","冬":"dong","董":"dong","懂":"dong","动":"dong","栋":"dong","侗":"dong","恫":"dong","冻":"dong","洞":"dong","兜":"dou","抖":"dou","斗":"dou","陡":"dou","豆":"dou","逗":"dou","痘":"dou","都":"dou","督":"du","毒":"du","犊":"du","独":"du","读":"du","堵":"du","睹":"du","赌":"du","杜":"du","镀":"du","肚":"du","度":"du","渡":"du","妒":"du","端":"duan","短":"duan","锻":"duan","段":"duan","断":"duan","缎":"duan","堆":"dui","兑":"dui","队":"dui","对":"dui","墩":"dun","吨":"dun","蹲":"dun","敦":"dun","顿":"dun","囤":"tun","钝":"dun","盾":"dun","遁":"dun","掇":"duo","哆":"duo","多":"duo","夺":"duo","垛":"duo","躲":"duo","朵":"duo","跺":"duo","舵":"duo","剁":"duo","惰":"duo","堕":"duo","蛾":"e","峨":"e","鹅":"e","俄":"e","额":"e","讹":"e","娥":"e","恶":"e","厄":"e","扼":"e","遏":"e","鄂":"e","饿":"e","恩":"en","而":"er","儿":"er","耳":"er","尔":"er","饵":"er","洱":"er","二":"er","贰":"er","发":"fa","罚":"fa","筏":"fa","伐":"fa","乏":"fa","阀":"fa","法":"fa","珐":"fa","藩":"fan","帆":"fan","番":"fan","翻":"fan","樊":"fan","矾":"fan","钒":"fan","繁":"fan","凡":"fan","烦":"fan","反":"fan","返":"fan","范":"fan","贩":"fan","犯":"fan","饭":"fan","泛":"fan","坊":"fang","芳":"fang","方":"fang","肪":"fang","房":"fang","防":"fang","妨":"fang","仿":"fang","访":"fang","纺":"fang","放":"fang","菲":"fei","非":"fei","啡":"fei","飞":"fei","肥":"fei","匪":"fei","诽":"fei","吠":"fei","肺":"fei","废":"fei","沸":"fei","费":"fei","芬":"fen","酚":"fen","吩":"fen","氛":"fen","分":"fen","纷":"fen","坟":"fen","焚":"fen","汾":"fen","粉":"fen","奋":"fen","份":"fen","忿":"fen","愤":"fen","粪":"fen","丰":"feng","封":"feng","枫":"feng","蜂":"feng","峰":"feng","锋":"feng","风":"feng","疯":"feng","烽":"feng","逢":"feng","冯":"feng","缝":"feng","讽":"feng","奉":"feng","凤":"feng","佛":"fo","否":"fou","夫":"fu","敷":"fu","肤":"fu","孵":"fu","扶":"fu","拂":"fu","辐":"fu","幅":"fu","氟":"fu","符":"fu","伏":"fu","俘":"fu","服":"fu","浮":"fu","涪":"fu","福":"fu","袱":"fu","弗":"fu","甫":"fu","抚":"fu","辅":"fu","俯":"fu","釜":"fu","斧":"fu","脯":"pu","腑":"fu","府":"fu","腐":"fu","赴":"fu","副":"fu","覆":"fu","赋":"fu","复":"fu","傅":"fu","付":"fu","阜":"fu","父":"fu","腹":"fu","负":"fu","富":"fu","讣":"fu","附":"fu","妇":"fu","缚":"fu","咐":"fu","噶":"ga","嘎":"ga","该":"gai","改":"gai","概":"gai","钙":"gai","盖":"gai","溉":"gai","干":"gan","甘":"gan","杆":"gan","柑":"gan","竿":"gan","肝":"gan","赶":"gan","感":"gan","秆":"gan","敢":"gan","赣":"gan","冈":"gang","刚":"gang","钢":"gang","缸":"gang","肛":"gang","纲":"gang","岗":"gang","港":"gang","杠":"gang","篙":"gao","皋":"gao","高":"gao","膏":"gao","羔":"gao","糕":"gao","搞":"gao","镐":"hao","稿":"gao","告":"gao","哥":"ge","歌":"ge","搁":"ge","戈":"ge","鸽":"ge","胳":"ge","疙":"ge","割":"ge","革":"ge","葛":"ge","格":"ge","蛤":"ha","阁":"ge","隔":"ge","铬":"ge","个":"ge","各":"ge","给":"gei","根":"gen","跟":"gen","耕":"geng","更":"geng","庚":"geng","羹":"geng","埂":"geng","耿":"geng","梗":"geng","工":"gong","攻":"gong","功":"gong","恭":"gong","龚":"gong","供":"gong","躬":"gong","公":"gong","宫":"gong","弓":"gong","巩":"gong","汞":"gong","拱":"gong","贡":"gong","共":"gong","钩":"gou","勾":"gou","沟":"gou","苟":"gou","狗":"gou","垢":"gou","构":"gou","购":"gou","够":"gou","辜":"gu","菇":"gu","咕":"gu","箍":"gu","估":"gu","沽":"gu","孤":"gu","姑":"gu","鼓":"gu","古":"gu","蛊":"gu","骨":"gu","谷":"gu","股":"gu","故":"gu","顾":"gu","固":"gu","雇":"gu","刮":"gua","瓜":"gua","剐":"gua","寡":"gua","挂":"gua","褂":"gua","乖":"guai","拐":"guai","怪":"guai","棺":"guan","关":"guan","官":"guan","冠":"guan","观":"guan","管":"guan","馆":"guan","罐":"guan","惯":"guan","灌":"guan","贯":"guan","光":"guang","广":"guang","逛":"guang","瑰":"gui","规":"gui","圭":"gui","硅":"gui","归":"gui","龟":"gui","闺":"gui","轨":"gui","鬼":"gui","诡":"gui","癸":"gui","桂":"gui","柜":"gui","跪":"gui","贵":"gui","刽":"gui","辊":"gun","滚":"gun","棍":"gun","锅":"guo","郭":"guo","国":"guo","果":"guo","裹":"guo","过":"guo","哈":"ha","骸":"hai","孩":"hai","海":"hai","氦":"hai","亥":"hai","害":"hai","骇":"hai","酣":"han","憨":"han","邯":"han","韩":"han","含":"han","涵":"han","寒":"han","函":"han","喊":"han","罕":"han","翰":"han","撼":"han","捍":"han","旱":"han","憾":"han","悍":"han","焊":"han","汗":"han","汉":"han","夯":"hang","杭":"hang","航":"hang","壕":"hao","嚎":"hao","豪":"hao","毫":"hao","郝":"hao","好":"hao","耗":"hao","号":"hao","浩":"hao","呵":"he","喝":"he","荷":"he","菏":"he","核":"he","禾":"he","和":"he","何":"he","合":"he","盒":"he","貉":"mo","阂":"he","河":"he","涸":"he","赫":"he","褐":"he","鹤":"he","贺":"he","嘿":"hei","黑":"hei","痕":"hen","很":"hen","狠":"hen","恨":"hen","哼":"heng","亨":"heng","横":"heng","衡":"heng","恒":"heng","轰":"hong","哄":"hong","烘":"hong","虹":"hong","鸿":"hong","洪":"hong","宏":"hong","弘":"hong","红":"hong","喉":"hou","侯":"hou","猴":"hou","吼":"hou","厚":"hou","候":"hou","后":"hou","呼":"hu","乎":"hu","忽":"hu","瑚":"hu","壶":"hu","葫":"hu","胡":"hu","蝴":"hu","狐":"hu","糊":"hu","湖":"hu","弧":"hu","虎":"hu","唬":"hu","护":"hu","互":"hu","沪":"hu","户":"hu","花":"hua","哗":"hua","华":"hua","猾":"hua","滑":"hua","画":"hua","划":"hua","化":"hua","话":"hua","槐":"huai","徊":"huai","怀":"huai","淮":"huai","坏":"huai","欢":"huan","环":"huan","桓":"huan","还":"hai","缓":"huan","换":"huan","患":"huan","唤":"huan","痪":"huan","豢":"huan","焕":"huan","涣":"huan","宦":"huan","幻":"huan","荒":"huang","慌":"huang","黄":"huang","磺":"huang","蝗":"huang","簧":"huang","皇":"huang","凰":"huang","惶":"huang","煌":"huang","晃":"huang","幌":"huang","恍":"huang","谎":"huang","灰":"hui","挥":"hui","辉":"hui","徽":"hui","恢":"hui","蛔":"hui","回":"hui","毁":"hui","悔":"hui","慧":"hui","卉":"hui","惠":"hui","晦":"hui","贿":"hui","秽":"hui","会":"hui","烩":"hui","汇":"hui","讳":"hui","诲":"hui","绘":"hui","荤":"hun","昏":"hun","婚":"hun","魂":"hun","浑":"hun","混":"hun","豁":"huo","活":"huo","伙":"huo","火":"huo","获":"huo","或":"huo","惑":"huo","霍":"huo","货":"huo","祸":"huo","击":"ji","圾":"ji","基":"ji","机":"ji","畸":"ji","稽":"ji","积":"ji","箕":"ji","肌":"ji","饥":"ji","迹":"ji","激":"ji","讥":"ji","鸡":"ji","姬":"ji","绩":"ji","缉":"ji","吉":"ji","极":"ji","棘":"ji","辑":"ji","籍":"ji","集":"ji","及":"ji","急":"ji","疾":"ji","汲":"ji","即":"ji","嫉":"ji","级":"ji","挤":"ji","几":"ji","脊":"ji","己":"ji","蓟":"ji","技":"ji","冀":"ji","季":"ji","伎":"ji","祭":"ji","剂":"ji","悸":"ji","济":"ji","寄":"ji","寂":"ji","计":"ji","记":"ji","既":"ji","忌":"ji","际":"ji","妓":"ji","继":"ji","纪":"ji","嘉":"jia","枷":"jia","夹":"jia","佳":"jia","家":"jia","加":"jia","荚":"jia","颊":"jia","贾":"jia","甲":"jia","钾":"jia","假":"jia","稼":"jia","价":"jia","架":"jia","驾":"jia","嫁":"jia","歼":"jian","监":"jian","坚":"jian","尖":"jian","笺":"jian","间":"jian","煎":"jian","兼":"jian","肩":"jian","艰":"jian","奸":"jian","缄":"jian","茧":"jian","检":"jian","柬":"jian","碱":"jian","硷":"jian","拣":"jian","捡":"jian","简":"jian","俭":"jian","剪":"jian","减":"jian","荐":"jian","槛":"kan","鉴":"jian","践":"jian","贱":"jian","见":"jian","键":"jian","箭":"jian","件":"jian","健":"jian","舰":"jian","剑":"jian","饯":"jian","渐":"jian","溅":"jian","涧":"jian","建":"jian","僵":"jiang","姜":"jiang","将":"jiang","浆":"jiang","江":"jiang","疆":"jiang","蒋":"jiang","桨":"jiang","奖":"jiang","讲":"jiang","匠":"jiang","酱":"jiang","降":"jiang","蕉":"jiao","椒":"jiao","礁":"jiao","焦":"jiao","胶":"jiao","交":"jiao","郊":"jiao","浇":"jiao","骄":"jiao","娇":"jiao","嚼":"jiao","搅":"jiao","铰":"jiao","矫":"jiao","侥":"jiao","脚":"jiao","狡":"jiao","角":"jiao","饺":"jiao","缴":"jiao","绞":"jiao","剿":"jiao","教":"jiao","酵":"jiao","轿":"jiao","较":"jiao","叫":"jiao","窖":"jiao","揭":"jie","接":"jie","皆":"jie","秸":"jie","街":"jie","阶":"jie","截":"jie","劫":"jie","节":"jie","桔":"ju","杰":"jie","捷":"jie","睫":"jie","竭":"jie","洁":"jie","结":"jie","解":"jie","姐":"jie","戒":"jie","藉":"jie","芥":"jie","界":"jie","借":"jie","介":"jie","疥":"jie","诫":"jie","届":"jie","巾":"jin","筋":"jin","斤":"jin","金":"jin","今":"jin","津":"jin","襟":"jin","紧":"jin","锦":"jin","仅":"jin","谨":"jin","进":"jin","靳":"jin","晋":"jin","禁":"jin","近":"jin","烬":"jin","浸":"jin","尽":"jin","劲":"jin","荆":"jing","兢":"jing","茎":"jing","睛":"jing","晶":"jing","鲸":"jing","京":"jing","惊":"jing","精":"jing","粳":"jing","经":"jing","井":"jing","警":"jing","景":"jing","颈":"jing","静":"jing","境":"jing","敬":"jing","镜":"jing","径":"jing","痉":"jing","靖":"jing","竟":"jing","竞":"jing","净":"jing","炯":"jiong","窘":"jiong","揪":"jiu","究":"jiu","纠":"jiu","玖":"jiu","韭":"jiu","久":"jiu","灸":"jiu","九":"jiu","酒":"jiu","厩":"jiu","救":"jiu","旧":"jiu","臼":"jiu","舅":"jiu","咎":"jiu","就":"jiu","疚":"jiu","鞠":"ju","拘":"ju","狙":"ju","疽":"ju","居":"ju","驹":"ju","菊":"ju","局":"ju","咀":"zui","矩":"ju","举":"ju","沮":"ju","聚":"ju","拒":"ju","据":"ju","巨":"ju","具":"ju","距":"ju","踞":"ju","锯":"ju","俱":"ju","句":"ju","惧":"ju","炬":"ju","剧":"ju","捐":"juan","鹃":"juan","娟":"juan","倦":"juan","眷":"juan","卷":"juan","绢":"juan","撅":"jue","攫":"jue","抉":"jue","掘":"jue","倔":"jue","爵":"jue","觉":"jue","决":"jue","诀":"jue","绝":"jue","均":"jun","菌":"jun","钧":"jun","军":"jun","君":"jun","峻":"jun","俊":"jun","竣":"jun","浚":"jun","郡":"jun","骏":"jun","喀":"ka","咖":"ka","卡":"ka","咯":"ge","开":"kai","揩":"kai","楷":"kai","凯":"kai","慨":"kai","刊":"kan","堪":"kan","勘":"kan","坎":"kan","砍":"kan","看":"kan","康":"kang","慷":"kang","糠":"kang","扛":"kang","抗":"kang","亢":"kang","炕":"kang","考":"kao","拷":"kao","烤":"kao","靠":"kao","坷":"ke","苛":"ke","柯":"ke","棵":"ke","磕":"ke","颗":"ke","科":"ke","壳":"ke","咳":"hai","可":"ke","渴":"ke","克":"ke","刻":"ke","客":"ke","课":"ke","肯":"ken","啃":"ken","垦":"ken","恳":"ken","坑":"keng","吭":"keng","空":"kong","恐":"kong","孔":"kong","控":"kong","抠":"kou","口":"kou","扣":"kou","寇":"kou","枯":"ku","哭":"ku","窟":"ku","苦":"ku","酷":"ku","库":"ku","裤":"ku","夸":"kua","垮":"kua","挎":"kua","跨":"kua","胯":"kua","块":"kuai","筷":"kuai","侩":"kuai","快":"kuai","宽":"kuan","款":"kuan","匡":"kuang","筐":"kuang","狂":"kuang","框":"kuang","矿":"kuang","眶":"kuang","旷":"kuang","况":"kuang","亏":"kui","盔":"kui","岿":"kui","窥":"kui","葵":"kui","奎":"kui","魁":"kui","傀":"kui","馈":"kui","愧":"kui","溃":"kui","坤":"kun","昆":"kun","捆":"kun","困":"kun","括":"kuo","扩":"kuo","廓":"kuo","阔":"kuo","垃":"la","拉":"la","喇":"la","蜡":"la","腊":"la","辣":"la","啦":"la","莱":"lai","来":"lai","赖":"lai","蓝":"lan","婪":"lan","栏":"lan","拦":"lan","篮":"lan","阑":"lan","兰":"lan","澜":"lan","谰":"lan","揽":"lan","览":"lan","懒":"lan","缆":"lan","烂":"lan","滥":"lan","琅":"lang","榔":"lang","狼":"lang","廊":"lang","郎":"lang","朗":"lang","浪":"lang","捞":"lao","劳":"lao","牢":"lao","老":"lao","佬":"lao","姥":"lao","酪":"lao","烙":"lao","涝":"lao","勒":"le","乐":"le","雷":"lei","镭":"lei","蕾":"lei","磊":"lei","累":"lei","儡":"lei","垒":"lei","擂":"lei","肋":"lei","类":"lei","泪":"lei","棱":"leng","楞":"leng","冷":"leng","厘":"li","梨":"li","犁":"li","黎":"li","篱":"li","狸":"li","离":"li","漓":"li","理":"li","李":"li","里":"li","鲤":"li","礼":"li","莉":"li","荔":"li","吏":"li","栗":"li","丽":"li","厉":"li","励":"li","砾":"li","历":"li","利":"li","傈":"li","例":"li","俐":"li","痢":"li","立":"li","粒":"li","沥":"li","隶":"li","力":"li","璃":"li","哩":"li","俩":"lia","联":"lian","莲":"lian","连":"lian","镰":"lian","廉":"lian","怜":"lian","涟":"lian","帘":"lian","敛":"lian","脸":"lian","链":"lian","恋":"lian","炼":"lian","练":"lian","粮":"liang","凉":"liang","梁":"liang","粱":"liang","良":"liang","两":"liang","辆":"liang","量":"liang","晾":"liang","亮":"liang","谅":"liang","撩":"liao","聊":"liao","僚":"liao","疗":"liao","燎":"liao","寥":"liao","辽":"liao","潦":"liao","了":"liao","撂":"liao","镣":"liao","廖":"liao","料":"liao","列":"lie","裂":"lie","烈":"lie","劣":"lie","猎":"lie","琳":"lin","林":"lin","磷":"lin","霖":"lin","临":"lin","邻":"lin","鳞":"lin","淋":"lin","凛":"lin","赁":"lin","吝":"lin","拎":"lin","玲":"ling","菱":"ling","零":"ling","龄":"ling","铃":"ling","伶":"ling","羚":"ling","凌":"ling","灵":"ling","陵":"ling","岭":"ling","领":"ling","另":"ling","令":"ling","溜":"liu","琉":"liu","榴":"liu","硫":"liu","馏":"liu","留":"liu","刘":"liu","瘤":"liu","流":"liu","柳":"liu","六":"liu","龙":"long","聋":"long","咙":"long","笼":"long","窿":"long","隆":"long","垄":"long","拢":"long","陇":"long","楼":"lou","娄":"lou","搂":"lou","篓":"lou","漏":"lou","陋":"lou","芦":"lu","卢":"lu","颅":"lu","庐":"lu","炉":"lu","掳":"lu","卤":"lu","虏":"lu","鲁":"lu","麓":"lu","碌":"lu","露":"lu","路":"lu","赂":"lu","鹿":"lu","潞":"lu","禄":"lu","录":"lu","陆":"lu","戮":"lu","驴":"lü","吕":"lü","铝":"lü","侣":"lü","旅":"lü","履":"lü","屡":"lü","缕":"lü","虑":"lü","氯":"lü","律":"lü","率":"lü","滤":"lü","绿":"lü","峦":"luan","挛":"luan","孪":"luan","滦":"luan","卵":"luan","乱":"luan","掠":"lüe","略":"lüe","抡":"lun","轮":"lun","伦":"lun","仑":"lun","沦":"lun","纶":"lun","论":"lun","萝":"luo","螺":"luo","罗":"luo","逻":"luo","锣":"luo","箩":"luo","骡":"luo","裸":"luo","落":"luo","洛":"luo","骆":"luo","络":"luo","妈":"ma","麻":"ma","玛":"ma","码":"ma","蚂":"ma","马":"ma","骂":"ma","嘛":"ma","吗":"ma","埋":"mai","买":"mai","麦":"mai","卖":"mai","迈":"mai","脉":"mai","瞒":"man","馒":"man","蛮":"man","满":"man","蔓":"man","曼":"man","慢":"man","漫":"man","谩":"man","芒":"mang","茫":"mang","盲":"mang","氓":"mang","忙":"mang","莽":"mang","猫":"mao","茅":"mao","锚":"mao","毛":"mao","矛":"mao","铆":"mao","卯":"mao","茂":"mao","冒":"mao","帽":"mao","貌":"mao","贸":"mao","么":"me","玫":"mei","枚":"mei","梅":"mei","酶":"mei","霉":"mei","煤":"mei","没":"mei","眉":"mei","媒":"mei","镁":"mei","每":"mei","美":"mei","昧":"mei","寐":"mei","妹":"mei","媚":"mei","门":"men","闷":"men","们":"men","萌":"meng","蒙":"meng","檬":"meng","盟":"meng","锰":"meng","猛":"meng","梦":"meng","孟":"meng","眯":"mi","醚":"mi","靡":"mi","糜":"mi","迷":"mi","谜":"mi","弥":"mi","米":"mi","秘":"mi","觅":"mi","泌":"mi","蜜":"mi","密":"mi","幂":"mi","棉":"mian","眠":"mian","绵":"mian","冕":"mian","免":"mian","勉":"mian","娩":"mian","缅":"mian","面":"mian","苗":"miao","描":"miao","瞄":"miao","藐":"miao","秒":"miao","渺":"miao","庙":"miao","妙":"miao","蔑":"mie","灭":"mie","民":"min","抿":"min","皿":"min","敏":"min","悯":"min","闽":"min","明":"ming","螟":"ming","鸣":"ming","铭":"ming","名":"ming","命":"ming","谬":"miu","摸":"mo","摹":"mo","蘑":"mo","模":"mo","膜":"mo","磨":"mo","摩":"mo","魔":"mo","抹":"mo","末":"mo","莫":"mo","墨":"mo","默":"mo","沫":"mo","漠":"mo","寞":"mo","陌":"mo","谋":"mou","牟":"mu","某":"mou","拇":"mu","牡":"mu","亩":"mu","姆":"mu","母":"mu","墓":"mu","暮":"mu","幕":"mu","募":"mu","慕":"mu","木":"mu","目":"mu","睦":"mu","牧":"mu","穆":"mu","拿":"na","哪":"na","呐":"na","钠":"na","那":"na","娜":"na","纳":"na","氖":"nai","乃":"nai","奶":"nai","耐":"nai","奈":"nai","南":"nan","男":"nan","难":"nan","囊":"nang","挠":"nao","脑":"nao","恼":"nao","闹":"nao","淖":"nao","呢":"ne","馁":"nei","内":"nei","嫩":"nen","能":"neng","妮":"ni","霓":"ni","倪":"ni","泥":"ni","尼":"ni","拟":"ni","你":"ni","匿":"ni","腻":"ni","逆":"ni","溺":"ni","蔫":"nian","拈":"nian","年":"nian","碾":"nian","撵":"nian","捻":"nian","念":"nian","娘":"niang","酿":"niang","鸟":"niao","尿":"niao","捏":"nie","聂":"nie","孽":"nie","啮":"nie","镊":"nie","镍":"nie","涅":"nie","您":"nin","柠":"ning","狞":"ning","凝":"ning","宁":"ning","拧":"ning","泞":"ning","牛":"niu","扭":"niu","钮":"niu","纽":"niu","脓":"nong","浓":"nong","农":"nong","弄":"nong","奴":"nu","努":"nu","怒":"nu","女":"nü","暖":"nuan","虐":"nüe","疟":"nüe","挪":"nuo","懦":"nuo","糯":"nuo","诺":"nuo","哦":"o","欧":"ou","鸥":"ou","殴":"ou","藕":"ou","呕":"ou","偶":"ou","沤":"ou","啪":"pa","趴":"pa","爬":"pa","帕":"pa","怕":"pa","琶":"pa","拍":"pai","排":"pai","牌":"pai","徘":"pai","湃":"pai","派":"pai","攀":"pan","潘":"pan","盘":"pan","磐":"pan","盼":"pan","畔":"pan","判":"pan","叛":"pan","乓":"pang","庞":"pang","旁":"pang","耪":"pang","胖":"pang","抛":"pao","咆":"pao","刨":"pao","炮":"pao","袍":"pao","跑":"pao","泡":"pao","呸":"pei","胚":"pei","培":"pei","裴":"pei","赔":"pei","陪":"pei","配":"pei","佩":"pei","沛":"pei","喷":"pen","盆":"pen","砰":"peng","抨":"peng","烹":"peng","澎":"peng","彭":"peng","蓬":"peng","棚":"peng","硼":"peng","篷":"peng","膨":"peng","朋":"peng","鹏":"peng","捧":"peng","碰":"peng","坯":"pi","砒":"pi","霹":"pi","批":"pi","披":"pi","劈":"pi","琵":"pi","毗":"pi","啤":"pi","脾":"pi","疲":"pi","皮":"pi","匹":"pi","痞":"pi","僻":"pi","屁":"pi","譬":"pi","篇":"pian","偏":"pian","片":"pian","骗":"pian","飘":"piao","漂":"piao","瓢":"piao","票":"piao","撇":"pie","瞥":"pie","拼":"pin","频":"pin","贫":"pin","品":"pin","聘":"pin","乒":"ping","坪":"ping","苹":"ping","萍":"ping","平":"ping","凭":"ping","瓶":"ping","评":"ping","屏":"ping","坡":"po","泼":"po","颇":"po","婆":"po","破":"po","魄":"po","迫":"po","粕":"po","剖":"pou","扑":"pu","铺":"pu","仆":"pu","莆":"pu","葡":"pu","菩":"pu","蒲":"pu","埔":"pu","朴":"pu","圃":"pu","普":"pu","浦":"pu","谱":"pu","曝":"pu","瀑":"pu","期":"qi","欺":"qi","栖":"qi","戚":"qi","妻":"qi","七":"qi","凄":"qi","漆":"qi","柒":"qi","沏":"qi","其":"qi","棋":"qi","奇":"qi","歧":"qi","畦":"qi","崎":"qi","脐":"qi","齐":"qi","旗":"qi","祈":"qi","祁":"qi","骑":"qi","起":"qi","岂":"qi","乞":"qi","企":"qi","启":"qi","契":"qi","砌":"qi","器":"qi","气":"qi","迄":"qi","弃":"qi","汽":"qi","泣":"qi","讫":"qi","掐":"qia","恰":"qia","洽":"qia","牵":"qian","扦":"qian","钎":"qian","铅":"qian","千":"qian","迁":"qian","签":"qian","仟":"qian","谦":"qian","乾":"qian","黔":"qian","钱":"qian","钳":"qian","前":"qian","潜":"qian","遣":"qian","浅":"qian","谴":"qian","堑":"qian","嵌":"qian","欠":"qian","歉":"qian","枪":"qiang","呛":"qiang","腔":"qiang","羌":"qiang","墙":"qiang","蔷":"qiang","强":"qiang","抢":"qiang","橇":"qiao","锹":"qiao","敲":"qiao","悄":"qiao","桥":"qiao","瞧":"qiao","乔":"qiao","侨":"qiao","巧":"qiao","鞘":"qiao","撬":"qiao","翘":"qiao","峭":"qiao","俏":"qiao","窍":"qiao","切":"qie","茄":"qie","且":"qie","怯":"qie","窃":"qie","钦":"qin","侵":"qin","亲":"qin","秦":"qin","琴":"qin","勤":"qin","芹":"qin","擒":"qin","禽":"qin","寝":"qin","沁":"qin","青":"qing","轻":"qing","氢":"qing","倾":"qing","卿":"qing","清":"qing","擎":"qing","晴":"qing","氰":"qing","情":"qing","顷":"qing","请":"qing","庆":"qing","琼":"qiong","穷":"qiong","秋":"qiu","丘":"qiu","邱":"qiu","球":"qiu","求":"qiu","囚":"qiu","酋":"qiu","泅":"qiu","趋":"qu","区":"qu","蛆":"qu","曲":"qu","躯":"qu","屈":"qu","驱":"qu","渠":"qu","取":"qu","娶":"qu","龋":"qu","趣":"qu","去":"qu","圈":"quan","颧":"quan","权":"quan","醛":"quan","泉":"quan","全":"quan","痊":"quan","拳":"quan","犬":"quan","券":"quan","劝":"quan","缺":"que","炔":"que","瘸":"que","却":"que","鹊":"que","榷":"que","确":"que","雀":"que","裙":"qun","群":"qun","然":"ran","燃":"ran","冉":"ran","染":"ran","瓤":"rang","壤":"rang","攘":"rang","嚷":"rang","让":"rang","饶":"rao","扰":"rao","绕":"rao","惹":"re","热":"re","壬":"ren","仁":"ren","人":"ren","忍":"ren","韧":"ren","任":"ren","认":"ren","刃":"ren","妊":"ren","纫":"ren","扔":"reng","仍":"reng","日":"ri","戎":"rong","茸":"rong","蓉":"rong","荣":"rong","融":"rong","熔":"rong","溶":"rong","容":"rong","绒":"rong","冗":"rong","揉":"rou","柔":"rou","肉":"rou","茹":"ru","蠕":"ru","儒":"ru","孺":"ru","如":"ru","辱":"ru","乳":"ru","汝":"ru","入":"ru","褥":"ru","软":"ruan","阮":"ruan","蕊":"rui","瑞":"rui","锐":"rui","闰":"run","润":"run","若":"ruo","弱":"ruo","撒":"sa","洒":"sa","萨":"sa","腮":"sai","鳃":"sai","塞":"sai","赛":"sai","三":"san","叁":"san","伞":"san","散":"san","桑":"sang","嗓":"sang","丧":"sang","搔":"sao","骚":"sao","扫":"sao","嫂":"sao","瑟":"se","色":"se","涩":"se","森":"sen","僧":"seng","莎":"sha","砂":"sha","杀":"sha","刹":"cha","沙":"sha","纱":"sha","傻":"sha","啥":"sha","煞":"sha","筛":"shai","晒":"shai","珊":"shan","苫":"shan","杉":"shan","山":"shan","删":"shan","煽":"shan","衫":"shan","闪":"shan","陕":"shan","擅":"shan","赡":"shan","膳":"shan","善":"shan","汕":"shan","扇":"shan","缮":"shan","墒":"shang","伤":"shang","商":"shang","赏":"shang","晌":"shang","上":"shang","尚":"shang","裳":"shang","梢":"shao","捎":"shao","稍":"shao","烧":"shao","芍":"shao","勺":"shao","韶":"shao","少":"shao","哨":"shao","邵":"shao","绍":"shao","奢":"she","赊":"she","蛇":"she","舌":"she","舍":"she","赦":"she","摄":"she","射":"she","慑":"she","涉":"she","社":"she","设":"she","砷":"shen","申":"shen","呻":"shen","伸":"shen","身":"shen","深":"shen","娠":"shen","绅":"shen","神":"shen","沈":"shen","审":"shen","婶":"shen","甚":"shen","肾":"shen","慎":"shen","渗":"shen","声":"sheng","生":"sheng","甥":"sheng","牲":"sheng","升":"sheng","绳":"sheng","省":"sheng","盛":"sheng","剩":"sheng","胜":"sheng","圣":"sheng","师":"shi","失":"shi","狮":"shi","施":"shi","湿":"shi","诗":"shi","尸":"shi","虱":"shi","十":"shi","石":"shi","拾":"shi","时":"shi","什":"shen","食":"shi","蚀":"shi","实":"shi","识":"shi","史":"shi","矢":"shi","使":"shi","屎":"shi","驶":"shi","始":"shi","式":"shi","示":"shi","士":"shi","世":"shi","柿":"shi","事":"shi","拭":"shi","誓":"shi","逝":"shi","势":"shi","是":"shi","嗜":"shi","噬":"shi","适":"shi","仕":"shi","侍":"shi","释":"shi","饰":"shi","氏":"shi","市":"shi","恃":"shi","室":"shi","视":"shi","试":"shi","收":"shou","手":"shou","首":"shou","守":"shou","寿":"shou","授":"shou","售":"shou","受":"shou","瘦":"shou","兽":"shou","蔬":"shu","枢":"shu","梳":"shu","殊":"shu","抒":"shu","输":"shu","叔":"shu","舒":"shu","淑":"shu","疏":"shu","书":"shu","赎":"shu","孰":"shu","熟":"shu","薯":"shu","暑":"shu","曙":"shu","署":"shu","蜀":"shu","黍":"shu","鼠":"shu","属":"shu","术":"shu","述":"shu","树":"shu","束":"shu","戍":"shu","竖":"shu","墅":"shu","庶":"shu","数":"shu","漱":"shu","恕":"shu","刷":"shua","耍":"shua","摔":"shuai","衰":"shuai","甩":"shuai","帅":"shuai","栓":"shuan","拴":"shuan","霜":"shuang","双":"shuang","爽":"shuang","谁":"shui","水":"shui","睡":"shui","税":"shui","吮":"shun","瞬":"shun","顺":"shun","舜":"shun","说":"shuo","硕":"shuo","朔":"shuo","烁":"shuo","斯":"si","撕":"si","嘶":"si","思":"si","私":"si","司":"si","丝":"si","死":"si","肆":"si","寺":"si","嗣":"si","四":"si","伺":"si","似":"si","饲":"si","巳":"si","松":"song","耸":"song","怂":"song","颂":"song","送":"song","宋":"song","讼":"song","诵":"song","搜":"sou","艘":"sou","擞":"sou","嗽":"sou","苏":"su","酥":"su","俗":"su","素":"su","速":"su","粟":"su","僳":"su","塑":"su","溯":"su","宿":"su","诉":"su","肃":"su","酸":"suan","蒜":"suan","算":"suan","虽":"sui","隋":"sui","随":"sui","绥":"sui","髓":"sui","碎":"sui","岁":"sui","穗":"sui","遂":"sui","隧":"sui","祟":"sui","孙":"sun","损":"sun","笋":"sun","蓑":"suo","梭":"suo","唆":"suo","缩":"suo","琐":"suo","索":"suo","锁":"suo","所":"suo","塌":"ta","他":"ta","它":"ta","她":"ta","塔":"ta","獭":"ta","挞":"ta","蹋":"ta","踏":"ta","胎":"tai","苔":"tai","抬":"tai","台":"tai","泰":"tai","酞":"tai","太":"tai","态":"tai","汰":"tai","坍":"tan","摊":"tan","贪":"tan","瘫":"tan","滩":"tan","坛":"tan","檀":"tan","痰":"tan","潭":"tan","谭":"tan","谈":"tan","坦":"tan","毯":"tan","袒":"tan","碳":"tan","探":"tan","叹":"tan","炭":"tan","汤":"tang","塘":"tang","搪":"tang","堂":"tang","棠":"tang","膛":"tang","唐":"tang","糖":"tang","倘":"tang","躺":"tang","淌":"tang","趟":"tang","烫":"tang","掏":"tao","涛":"tao","滔":"tao","绦":"tao","萄":"tao","桃":"tao","逃":"tao","淘":"tao","陶":"tao","讨":"tao","套":"tao","特":"te","藤":"teng","腾":"teng","疼":"teng","誊":"teng","梯":"ti","剔":"ti","踢":"ti","锑":"ti","提":"ti","题":"ti","蹄":"ti","啼":"ti","体":"ti","替":"ti","嚏":"ti","惕":"ti","涕":"ti","剃":"ti","屉":"ti","天":"tian","添":"tian","填":"tian","田":"tian","甜":"tian","恬":"tian","舔":"tian","腆":"tian","挑":"tiao","条":"tiao","迢":"tiao","眺":"tiao","跳":"tiao","贴":"tie","铁":"tie","帖":"tie","厅":"ting","听":"ting","烃":"ting","汀":"ting","廷":"ting","停":"ting","亭":"ting","庭":"ting","挺":"ting","艇":"ting","通":"tong","桐":"tong","酮":"tong","瞳":"tong","同":"tong","铜":"tong","彤":"tong","童":"tong","桶":"tong","捅":"tong","筒":"tong","统":"tong","痛":"tong","偷":"tou","投":"tou","头":"tou","透":"tou","凸":"tu","秃":"tu","突":"tu","图":"tu","徒":"tu","途":"tu","涂":"tu","屠":"tu","土":"tu","吐":"tu","兔":"tu","湍":"tuan","团":"tuan","推":"tui","颓":"tui","腿":"tui","蜕":"tui","褪":"tui","退":"tui","吞":"tun","屯":"tun","臀":"tun","拖":"tuo","托":"tuo","脱":"tuo","鸵":"tuo","陀":"tuo","驮":"tuo","驼":"tuo","椭":"tuo","妥":"tuo","拓":"tuo","唾":"tuo","挖":"wa","哇":"wa","蛙":"wa","洼":"wa","娃":"wa","瓦":"wa","袜":"wa","歪":"wai","外":"wai","豌":"wan","弯":"wan","湾":"wan","玩":"wan","顽":"wan","丸":"wan","烷":"wan","完":"wan","碗":"wan","挽":"wan","晚":"wan","皖":"wan","惋":"wan","宛":"wan","婉":"wan","万":"wan","腕":"wan","汪":"wang","王":"wang","亡":"wang","枉":"wang","网":"wang","往":"wang","旺":"wang","望":"wang","忘":"wang","妄":"wang","威":"wei","巍":"wei","微":"wei","危":"wei","韦":"wei","违":"wei","桅":"wei","围":"wei","唯":"wei","惟":"wei","为":"wei","潍":"wei","维":"wei","苇":"wei","萎":"wei","委":"wei","伟":"wei","伪":"wei","尾":"wei","纬":"wei","未":"wei","蔚":"wei","味":"wei","畏":"wei","胃":"wei","喂":"wei","魏":"wei","位":"wei","渭":"wei","谓":"wei","尉":"wei","慰":"wei","卫":"wei","瘟":"wen","温":"wen","蚊":"wen","文":"wen","闻":"wen","纹":"wen","吻":"wen","稳":"wen","紊":"wen","问":"wen","嗡":"weng","翁":"weng","瓮":"weng","挝":"wo","蜗":"wo","涡":"wo","窝":"wo","我":"wo","斡":"wo","卧":"wo","握":"wo","沃":"wo","巫":"wu","呜":"wu","钨":"wu","乌":"wu","污":"wu","诬":"wu","屋":"wu","无":"wu","芜":"wu","梧":"wu","吾":"wu","吴":"wu","毋":"wu","武":"wu","五":"wu","捂":"wu","午":"wu","舞":"wu","伍":"wu","侮":"wu","坞":"wu","戊":"wu","雾":"wu","晤":"wu","物":"wu","勿":"wu","务":"wu","悟":"wu","误":"wu","昔":"xi","熙":"xi","析":"xi","西":"xi","硒":"xi","矽":"xi","晰":"xi","嘻":"xi","吸":"xi","锡":"xi","牺":"xi","稀":"xi","息":"xi","希":"xi","悉":"xi","膝":"xi","夕":"xi","惜":"xi","熄":"xi","烯":"xi","溪":"xi","汐":"xi","犀":"xi","檄":"xi","袭":"xi","席":"xi","习":"xi","媳":"xi","喜":"xi","铣":"xian","洗":"xi","系":"xi","隙":"xi","戏":"xi","细":"xi","瞎":"xia","虾":"xia","匣":"xia","霞":"xia","辖":"xia","暇":"xia","峡":"xia","侠":"xia","狭":"xia","下":"xia","厦":"sha","夏":"xia","吓":"xia","掀":"xian","锨":"xian","先":"xian","仙":"xian","鲜":"xian","纤":"xian","咸":"xian","贤":"xian","衔":"xian","舷":"xian","闲":"xian","涎":"xian","弦":"xian","嫌":"xian","显":"xian","险":"xian","现":"xian","献":"xian","县":"xian","腺":"xian","馅":"xian","羡":"xian","宪":"xian","陷":"xian","限":"xian","线":"xian","相":"xiang","厢":"xiang","镶":"xiang","香":"xiang","箱":"xiang","襄":"xiang","湘":"xiang","乡":"xiang","翔":"xiang","祥":"xiang","详":"xiang","想":"xiang","响":"xiang","享":"xiang","项":"xiang","巷":"xiang","橡":"xiang","像":"xiang","向":"xiang","象":"xiang","萧":"xiao","硝":"xiao","霄":"xiao","削":"xiao","哮":"xiao","嚣":"ao","销":"xiao","消":"xiao","宵":"xiao","淆":"xiao","晓":"xiao","小":"xiao","孝":"xiao","校":"xiao","肖":"xiao","啸":"xiao","笑":"xiao","效":"xiao","楔":"xie","些":"xie","歇":"xie","蝎":"xie","鞋":"xie","协":"xie","挟":"xie","携":"xie","邪":"xie","斜":"xie","胁":"xie","谐":"xie","写":"xie","械":"xie","卸":"xie","蟹":"xie","懈":"xie","泄":"xie","泻":"xie","谢":"xie","屑":"xie","薪":"xin","芯":"xin","锌":"xin","欣":"xin","辛":"xin","新":"xin","忻":"xin","心":"xin","信":"xin","衅":"xin","星":"xing","腥":"xing","猩":"xing","惺":"xing","兴":"xing","刑":"xing","型":"xing","形":"xing","邢":"xing","行":"xing","醒":"xing","幸":"xing","杏":"xing","性":"xing","姓":"xing","兄":"xiong","凶":"xiong","胸":"xiong","匈":"xiong","汹":"xiong","雄":"xiong","熊":"xiong","休":"xiu","修":"xiu","羞":"xiu","朽":"xiu","嗅":"xiu","锈":"xiu","秀":"xiu","袖":"xiu","绣":"xiu","墟":"xu","戌":"xu","需":"xu","虚":"xu","嘘":"xu","须":"xu","徐":"xu","许":"xu","蓄":"xu","酗":"xu","叙":"xu","旭":"xu","序":"xu","畜":"chu","恤":"xu","絮":"xu","婿":"xu","绪":"xu","续":"xu","轩":"xuan","喧":"xuan","宣":"xuan","悬":"xuan","旋":"xuan","玄":"xuan","选":"xuan","癣":"xuan","眩":"xuan","绚":"xuan","靴":"xue","薛":"xue","学":"xue","穴":"xue","雪":"xue","血":"xue","勋":"xun","熏":"xun","循":"xun","旬":"xun","询":"xun","寻":"xun","驯":"xun","巡":"xun","殉":"xun","汛":"xun","训":"xun","讯":"xun","逊":"xun","迅":"xun","压":"ya","押":"ya","鸦":"ya","鸭":"ya","呀":"ya","丫":"ya","芽":"ya","牙":"ya","蚜":"ya","崖":"ya","衙":"ya","涯":"ya","雅":"ya","哑":"ya","亚":"ya","讶":"ya","焉":"yan","咽":"yan","阉":"yan","烟":"yan","淹":"yan","盐":"yan","严":"yan","研":"yan","蜒":"yan","岩":"yan","延":"yan","言":"yan","颜":"yan","阎":"yan","炎":"yan","沿":"yan","奄":"yan","掩":"yan","眼":"yan","衍":"yan","演":"yan","艳":"yan","堰":"yan","燕":"yan","厌":"yan","砚":"yan","雁":"yan","唁":"yan","彦":"yan","焰":"yan","宴":"yan","谚":"yan","验":"yan","殃":"yang","央":"yang","鸯":"yang","秧":"yang","杨":"yang","扬":"yang","佯":"yang","疡":"yang","羊":"yang","洋":"yang","阳":"yang","氧":"yang","仰":"yang","痒":"yang","养":"yang","样":"yang","漾":"yang","邀":"yao","腰":"yao","妖":"yao","瑶":"yao","摇":"yao","尧":"yao","遥":"yao","窑":"yao","谣":"yao","姚":"yao","咬":"yao","舀":"yao","药":"yao","要":"yao","耀":"yao","椰":"ye","噎":"ye","耶":"ye","爷":"ye","野":"ye","冶":"ye","也":"ye","页":"ye","掖":"ye","业":"ye","叶":"ye","曳":"ye","腋":"ye","夜":"ye","液":"ye","一":"yi","壹":"yi","医":"yi","揖":"yi","铱":"yi","依":"yi","伊":"yi","衣":"yi","颐":"yi","夷":"yi","遗":"yi","移":"yi","仪":"yi","胰":"yi","疑":"yi","沂":"yi","宜":"yi","姨":"yi","彝":"yi","椅":"yi","蚁":"yi","倚":"yi","已":"yi","乙":"yi","矣":"yi","以":"yi","艺":"yi","抑":"yi","易":"yi","邑":"yi","屹":"yi","亿":"yi","役":"yi","臆":"yi","逸":"yi","肄":"yi","疫":"yi","亦":"yi","裔":"yi","意":"yi","毅":"yi","忆":"yi","义":"yi","益":"yi","溢":"yi","诣":"yi","议":"yi","谊":"yi","译":"yi","异":"yi","翼":"yi","翌":"yi","绎":"yi","茵":"yin","荫":"yin","因":"yin","殷":"yin","音":"yin","阴":"yin","姻":"yin","吟":"yin","银":"yin","淫":"yin","寅":"yin","饮":"yin","尹":"yin","引":"yin","隐":"yin","印":"yin","英":"ying","樱":"ying","婴":"ying","鹰":"ying","应":"ying","缨":"ying","莹":"ying","萤":"ying","营":"ying","荧":"ying","蝇":"ying","迎":"ying","赢":"ying","盈":"ying","影":"ying","颖":"ying","硬":"ying","映":"ying","哟":"yo","拥":"yong","佣":"yong","臃":"yong","痈":"yong","庸":"yong","雍":"yong","踊":"yong","蛹":"yong","咏":"yong","泳":"yong","涌":"yong","永":"yong","恿":"yong","勇":"yong","用":"yong","幽":"you","优":"you","悠":"you","忧":"you","尤":"you","由":"you","邮":"you","铀":"you","犹":"you","油":"you","游":"you","酉":"you","有":"you","友":"you","右":"you","佑":"you","釉":"you","诱":"you","又":"you","幼":"you","迂":"yu","淤":"yu","于":"yu","盂":"yu","榆":"yu","虞":"yu","愚":"yu","舆":"yu","余":"yu","俞":"yu","逾":"yu","鱼":"yu","愉":"yu","渝":"yu","渔":"yu","隅":"yu","予":"yu","娱":"yu","雨":"yu","与":"yu","屿":"yu","禹":"yu","宇":"yu","语":"yu","羽":"yu","玉":"yu","域":"yu","芋":"yu","郁":"yu","吁":"xu","遇":"yu","喻":"yu","峪":"yu","御":"yu","愈":"yu","欲":"yu","狱":"yu","育":"yu","誉":"yu","浴":"yu","寓":"yu","裕":"yu","预":"yu","豫":"yu","驭":"yu","鸳":"yuan","渊":"yuan","冤":"yuan","元":"yuan","垣":"yuan","袁":"yuan","原":"yuan","援":"yuan","辕":"yuan","园":"yuan","员":"yuan","圆":"yuan","猿":"yuan","源":"yuan","缘":"yuan","远":"yuan","苑":"yuan","愿":"yuan","怨":"yuan","院":"yuan","曰":"yue","约":"yue","越":"yue","跃":"yue","钥":"yao","岳":"yue","粤":"yue","月":"yue","悦":"yue","阅":"yue","耘":"yun","云":"yun","郧":"yun","匀":"yun","陨":"yun","允":"yun","运":"yun","蕴":"yun","酝":"yun","晕":"yun","韵":"yun","孕":"yun","匝":"za","砸":"za","杂":"za","栽":"zai","哉":"zai","灾":"zai","宰":"zai","载":"zai","再":"zai","在":"zai","咱":"zan","攒":"zan","暂":"zan","赞":"zan","赃":"zang","脏":"zang","葬":"zang","遭":"zao","糟":"zao","凿":"zao","藻":"zao","枣":"zao","早":"zao","澡":"zao","蚤":"zao","躁":"zao","噪":"zao","造":"zao","皂":"zao","灶":"zao","燥":"zao","责":"ze","择":"ze","则":"ze","泽":"ze","贼":"zei","怎":"zen","增":"zeng","憎":"zeng","曾":"ceng","赠":"zeng","扎":"zha","喳":"zha","渣":"zha","札":"zha","轧":"ya","铡":"zha","闸":"zha","眨":"zha","栅":"shan","榨":"zha","咋":"za","乍":"zha","炸":"zha","诈":"zha","摘":"zhai","斋":"zhai","宅":"zhai","窄":"zhai","债":"zhai","寨":"zhai","瞻":"zhan","毡":"zhan","詹":"zhan","粘":"nian","沾":"zhan","盏":"zhan","斩":"zhan","辗":"nian","崭":"zhan","展":"zhan","蘸":"zhan","栈":"zhan","占":"zhan","战":"zhan","站":"zhan","湛":"zhan","绽":"zhan","樟":"zhang","章":"zhang","彰":"zhang","漳":"zhang","张":"zhang","掌":"zhang","涨":"zhang","杖":"zhang","丈":"zhang","帐":"zhang","账":"zhang","仗":"zhang","胀":"zhang","瘴":"zhang","障":"zhang","招":"zhao","昭":"zhao","找":"zhao","沼":"zhao","赵":"zhao","照":"zhao","罩":"zhao","兆":"zhao","肇":"zhao","召":"zhao","遮":"zhe","折":"zhe","哲":"zhe","蛰":"zhe","辙":"zhe","者":"zhe","锗":"zhe","蔗":"zhe","这":"zhe","浙":"zhe","珍":"zhen","斟":"zhen","真":"zhen","甄":"zhen","砧":"zhen","臻":"zhen","贞":"zhen","针":"zhen","侦":"zhen","枕":"zhen","疹":"zhen","诊":"zhen","震":"zhen","振":"zhen","镇":"zhen","阵":"zhen","蒸":"zheng","挣":"zheng","睁":"zheng","征":"zheng","狰":"zheng","争":"zheng","怔":"zheng","整":"zheng","拯":"zheng","正":"zheng","政":"zheng","帧":"zhen","症":"zheng","郑":"zheng","证":"zheng","芝":"zhi","枝":"zhi","支":"zhi","吱":"zhi","蜘":"zhi","知":"zhi","肢":"zhi","脂":"zhi","汁":"zhi","之":"zhi","织":"zhi","职":"zhi","直":"zhi","植":"zhi","殖":"zhi","执":"zhi","值":"zhi","侄":"zhi","址":"zhi","指":"zhi","止":"zhi","趾":"zhi","只":"zhi","旨":"zhi","纸":"zhi","志":"zhi","挚":"zhi","掷":"zhi","至":"zhi","致":"zhi","置":"zhi","帜":"zhi","峙":"zhi","制":"zhi","智":"zhi","秩":"zhi","稚":"zhi","质":"zhi","炙":"zhi","痔":"zhi","滞":"zhi","治":"zhi","窒":"zhi","中":"zhong","盅":"zhong","忠":"zhong","钟":"zhong","衷":"zhong","终":"zhong","种":"zhong","肿":"zhong","重":"zhong","仲":"zhong","众":"zhong","舟":"zhou","周":"zhou","州":"zhou","洲":"zhou","诌":"zhou","粥":"zhou","轴":"zhou","肘":"zhou","帚":"zhou","咒":"zhou","皱":"zhou","宙":"zhou","昼":"zhou","骤":"zhou","珠":"zhu","株":"zhu","蛛":"zhu","朱":"zhu","猪":"zhu","诸":"zhu","诛":"zhu","逐":"zhu","竹":"zhu","烛":"zhu","煮":"zhu","拄":"zhu","瞩":"zhu","嘱":"zhu","主":"zhu","著":"zhu","柱":"zhu","助":"zhu","蛀":"zhu","贮":"zhu","铸":"zhu","筑":"zhu","住":"zhu","注":"zhu","祝":"zhu","驻":"zhu","抓":"zhua","爪":"zhua","拽":"zhuai","专":"zhuan","砖":"zhuan","转":"zhuan","撰":"zhuan","赚":"zhuan","篆":"zhuan","桩":"zhuang","庄":"zhuang","装":"zhuang","妆":"zhuang","撞":"zhuang","壮":"zhuang","状":"zhuang","椎":"zhui","锥":"zhui","追":"zhui","赘":"zhui","坠":"zhui","缀":"zhui","谆":"zhun","准":"zhun","捉":"zhuo","拙":"zhuo","卓":"zhuo","桌":"zhuo","琢":"zhuo","茁":"zhuo","酌":"zhuo","啄":"zhuo","着":"zhe","灼":"zhuo","浊":"zhuo","兹":"zi","咨":"zi","资":"zi","姿":"zi","滋":"zi","淄":"zi","孜":"zi","紫":"zi","仔":"zai","籽":"zi","滓":"zi","子":"zi","自":"zi","渍":"zi","字":"zi","鬃":"zong","棕":"zong","踪":"zong","宗":"zong","综":"zong","总":"zong","纵":"zong","邹":"zou","走":"zou","奏":"zou","揍":"zou","租":"zu","足":"zu","卒":"zu","族":"zu","祖":"zu","诅":"zu","阻":"zu","组":"zu","钻":"zuan","纂":"zuan","嘴":"zui","醉":"zui","最":"zui","罪":"zui","尊":"zun","遵":"zun","昨":"zuo","左":"zuo","佐":"zuo","柞":"zha","做":"zuo","作":"zuo","坐":"zuo","座":"zuo","":"","":"","":"","":"","":""};

    /* 确定性伪随机：星尘位置每帧都要一样，不能用 Math.random。 */
    // ── 与 dsh-plugin-wallpaper-engine 的可选联动 ────────────────────────────────
// 该插件把壁纸画在 GUI 背景里（body[data-we-wallpaper]），没有对外服务。它用
// video / 同源 iframe（__wp 控制面）承载媒体；这里按"铺满视口"筛出壁纸面，
// 星河视图全屏时暂停它们，离开时恢复。插件没装、没开壁纸时一律跳过。
const WALLPAPER_ATTR = 'data-we-wallpaper'
/* 页面根节点：离开时要先播淡出，再切面板（组件此刻还在，切完才卸载）。 */
let rootEl = null
let leaving = false

function wallpaperMedia() {
  if (typeof document === 'undefined' || !document.body) return null
  if (!document.body.hasAttribute(WALLPAPER_ATTR)) return null
  const vw = window.innerWidth
  const vh = window.innerHeight
  const wide = (el) => {
    const r = el.getBoundingClientRect()
    return r.width >= vw * 0.55 && r.height >= vh * 0.55
  }
  const videos = []
  for (const v of document.querySelectorAll('video')) if (wide(v)) videos.push(v)
  const frames = []
  for (const f of document.querySelectorAll('iframe')) if (wide(f)) frames.push(f)
  if (!videos.length && !frames.length) return null
  return { videos, frames }
}

function setWallpaperPaused(paused) {
  const media = wallpaperMedia()
  if (!media) return
  for (const video of media.videos) {
    try {
      if (paused) {
        if (!video.paused) {
          video.__xgvWasPlaying = true
          video.pause()
        }
      } else if (video.__xgvWasPlaying) {
        delete video.__xgvWasPlaying
        const playing = video.play()
        if (playing && playing.catch) playing.catch(() => {})
      }
    } catch {}
  }
  for (const frame of media.frames) {
    try {
      const api = frame.contentWindow && frame.contentWindow.__wp
      if (!api) continue
      if (paused) {
        if (typeof api.pause === 'function') api.pause()
      } else if (typeof api.resume === 'function') api.resume()
    } catch {}
  }
}

const rnd01 = (i) => {
      const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
    /* 3D 投影：用四元数表示朝向（轨迹球），而不是 yaw/pitch 两个欧拉角。
       欧拉角在转到球顶时会出现万向节：同一方向拖动，过顶之后转向反了。
       四元数没有极点，任何朝向拖动的方向感都一致。
       返回屏幕坐标、深度缩放 s（近大远小）和视深度 z。 */
    const FOCAL = 2200;
    const qIdentity = () => [0, 0, 0, 1];
    const qMul = (a, b) => [
      a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
      a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
    ];
    const qAxis = (ax, ay, az, ang) => {
      const len = Math.hypot(ax, ay, az) || 1;
      const h = ang / 2;
      const s = Math.sin(h);
      return [(ax / len) * s, (ay / len) * s, (az / len) * s, Math.cos(h)];
    };
    const qMat = (q) => {
      const x = q[0];
      const y = q[1];
      const z = q[2];
      const w = q[3];
      return [
        1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
        2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
        2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y),
      ];
    };
    /* 把 from 方向转到 to 方向的最小旋转。聚焦某个星系时用它。 */
    const qFromTo = (from, to) => {
      const ax = from[0];
      const ay = from[1];
      const az = from[2];
      const bx = to[0];
      const by = to[1];
      const bz = to[2];
      const la = Math.hypot(ax, ay, az) || 1;
      const lb = Math.hypot(bx, by, bz) || 1;
      const a = [ax / la, ay / la, az / la];
      const b = [bx / lb, by / lb, bz / lb];
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      if (dot > 0.999999) return qIdentity();
      if (dot < -0.999999) return qAxis(1, 0, 0, Math.PI);
      const cx = a[1] * b[2] - a[2] * b[1];
      const cy = a[2] * b[0] - a[0] * b[2];
      const cz = a[0] * b[1] - a[1] * b[0];
      const q = [cx, cy, cz, 1 + dot];
      const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
      return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
    };
    const qNlerp = (a, b, t) => {
      const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
      const s = d < 0 ? -1 : 1;
      const x = a[0] + (b[0] * s - a[0]) * t;
      const y = a[1] + (b[1] * s - a[1]) * t;
      const z = a[2] + (b[2] * s - a[2]) * t;
      const w = a[3] + (b[3] * s - a[3]) * t;
      const l = Math.hypot(x, y, z, w) || 1;
      return [x / l, y / l, z / l, w / l];
    };
    /* q 把世界转到相机：旋转永远绕世界原点——原点就是球心。 */
    /* 姿态矩阵一帧只变一次：热点循环先把矩阵算好再传进来，别让每个点重建 3×3。 */
    const projectMat = (m, wx, wy, wz, cam, k, W, H) => {
      const x1 = m[0] * wx + m[1] * wy + m[2] * wz;
      const y1 = m[3] * wx + m[4] * wy + m[5] * wz;
      const z1 = m[6] * wx + m[7] * wy + m[8] * wz;
      const s = FOCAL / (FOCAL + z1);
      return { x: W / 2 + (x1 - cam.x) * k * s, y: H / 2 + (y1 - cam.y) * k * s, s, z: z1 };
    };
    const selAll = (s) => s;

    function hash01(str) {
      let x = 2166136261;
      for (let i = 0; i < str.length; i += 1) {
        x ^= str.charCodeAt(i);
        x = Math.imul(x, 16777619);
      }
      return ((x >>> 0) % 100000) / 100000;
    }

    function pyOf(ch) {
      if (!ch) return '';
      const code = ch.charCodeAt(0);
      if (code < 128) return /[a-z0-9]/i.test(ch) ? ch.toLowerCase() : '';
      return PY[ch] || '';
    }

    function toFullPinyin(text) {
      let out = '';
      for (const ch of String(text || '')) out += pyOf(ch);
      return out;
    }

    function toInitials(text) {
      let out = '';
      for (const ch of String(text || '')) {
        const p = pyOf(ch);
        if (p) out += p.charAt(0);
      }
      return out;
    }


    function scoreMatch(text, q) {
      if (!text || !q) return 0;
      const lower = String(text).toLowerCase();
      if (lower === q) return 240;
      if (lower.startsWith(q)) return 200;
      const idx = lower.indexOf(q);
      if (idx >= 0) return 170 - Math.min(40, idx * 5);
      const full = toFullPinyin(text);
      if (full) {
        if (full === q) return 190;
        if (full.startsWith(q)) return 150;
        if (full.includes(q)) return 120;
      }
      const ini = toInitials(text);
      if (ini) {
        if (ini === q) return 160;
        if (ini.startsWith(q)) return 130;
        if (ini.includes(q)) return 100;
      }
      return 0;
    }

    function truncate(text, max) {
      const s = String(text || '');
      return s.length > max ? s.slice(0, max) + '…' : s;
    }

    function shortPath(p) {
      if (!p) return '—';
      const parts = String(p).split(/[\\/]/).filter(Boolean);
      return parts.length ? parts[parts.length - 1] : String(p);
    }

    function statusOf(summary, status, archived) {
      if (archived) return 'archived';
      if (status && status.pendingInteraction) return 'pending';
      if ((status && status.running) || (summary && summary.running)) return 'running';
      return 'idle';
    }

    /* --------------------------------------------------------------- catalog */
    const EMPTY_WS = { items: [], archivedSessionIds: [], pinnedSessionIds: [], state: 'ready', phase: 'ready', error: undefined };
    const EMPTY_SESS = { ids: [], byId: {}, phase: 'ready', projectionsBySession: {} };
    const EMPTY_STATUS = new Map();

    function buildUniverse(wsSnap, sessSnap, statusSnap) {
      const sessions = sessSnap.byId || {};
      const allIds = sessSnap.ids || [];
      const archived = new Set(wsSnap.archivedSessionIds || []);
      const status = statusSnap || EMPTY_STATUS;
      const now = Date.now();

      const owner = new Set();
      const groups = [];
      for (const ws of wsSnap.items || []) {
        const sids = [];
        for (const sid of ws.sessionIds || []) {
          const summary = sessions[sid];
          if (!summary) continue;
          if (summary.origin === 'subagent') continue;
          owner.add(sid);
          sids.push(sid);
        }
        groups.push({
          id: ws.workspaceId,
          kind: 'workspace',
          title: ws.title || shortPath(ws.path),
          path: ws.path,
          sids,
        });
      }

      const loose = new Map();
      for (const sid of allIds) {
        if (owner.has(sid)) continue;
        const summary = sessions[sid];
        if (!summary || summary.origin === 'subagent') continue;
        const key = summary.cwd || '~';
        if (!loose.has(key)) loose.set(key, []);
        loose.get(key).push(sid);
      }
      for (const [key, sids] of loose) {
        groups.push({ id: 'loose:' + key, kind: 'loose', title: shortPath(key), path: key, sids });
      }

      const galaxies = groups
        .filter((g) => g.sids.length > 0)
        .map((g) => {
          const list = g.sids
            .slice()
            .sort((a, b) => (sessions[b].updatedAt || 0) - (sessions[a].updatedAt || 0));
          const planets = list.map((sid, i) => {
            const summary = sessions[sid];
            const st = status.get(sid);
            const ageHours = Math.max(0, now - (summary.updatedAt || 0)) / 3600000;
            const heat = clamp(Math.exp(-ageHours / 72), 0.06, 1);
            return {
              id: sid,
              groupId: g.id,
              title: summary.displayTitle || summary.title || sid.slice(0, 8),
              r: 28 + 16 * Math.sqrt(i + 0.55),
              a0: hash01(sid) * Math.PI * 2,
              speed: 0.06 / (1 + Math.sqrt(i) * 0.12),
              size: 3.1 + 4.4 * heat,
              heat,
              archived: archived.has(sid),
              state: statusOf(summary, st, archived.has(sid)),
              variant: Math.floor(hash01(sid + '#pv') * 10) % 10,
              updatedAt: summary.updatedAt || 0,
              summary,
            };
          });
          const outer = planets.length ? planets[planets.length - 1].r : 0;
          const activity = planets.reduce((m, p) => Math.max(m, p.updatedAt), 0);
          return {
            id: g.id,
            kind: g.kind,
            title: g.title,
            path: g.path,
            planets,
            radius: outer + 34,
            starSize: 7.6 + Math.min(9, planets.length) * 0.72,
            variant: Math.floor(hash01(g.id + '#sv') * 4) % 4,
            /* 轨道平面：每系倾角不同，并绕自身中心极缓慢进动。
               这样整个恒星系在空间里"转"，而不是一圈平面上的圆点。 */
            inc: (hash01(g.id + '#inc') - 0.5) * 1.5,
            prec: 0.012 + hash01(g.id + '#pr') * 0.018,
            tilt: 0.34 + hash01(g.id + '#tl') * 0.22,
            activity,
          };
        });

      galaxies.sort((a, b) => b.activity - a.activity || b.planets.length - a.planets.length);

      const n = galaxies.length;
      const maxVis = galaxies.reduce((m, g) => Math.max(m, g.radius + 64), 40);
      const spacing = maxVis * 2.05;
      /* 整个星河是一个球：星系均匀铺在球面上，球心留空，拖动时看起来是整颗球在转。
         Fibonacci 球面保证均匀；按活跃度排序后 i 越小越靠球的正前方（z 越小越近）。 */
      const globeR = Math.max(spacing * 1.2, spacing * Math.sqrt(n) * 0.72);
      const golden = Math.PI * (1 + Math.sqrt(5));
      galaxies.forEach((g, i) => {
        g.vis = g.radius + 64;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
        const theta = golden * (i + 0.5);
        /* 球面坐标，极轴取竖直方向：theta 随时间推进 = 整颗球面绕着球心公转。 */
        g.sph = { phi, theta, w: 0.008 + hash01(g.id + '#w') * 0.014 };
        const sr = Math.sin(phi);
        g.x = globeR * sr * Math.cos(theta);
        g.y = globeR * Math.cos(phi);
        g.z = globeR * sr * Math.sin(theta);
      });

      /* 球壳网格：6 条纬线 + 12 条经线半圈（合起来是 6 条完整大圆），每帧投影成 path。
         每条线拆成远/近两条：背面的线淡、正面的线亮，球体前后才分得开。 */
      const rings = [];
      for (const lat of [-66, -40, -14, 14, 40, 66]) {
        const ph = ((90 - lat) * Math.PI) / 180;
        const sp = Math.sin(ph);
        const cp = Math.cos(ph);
        const pts = [];
        for (let i = 0; i < 60; i += 1) {
          const a = (i / 60) * Math.PI * 2;
          pts.push({ x: globeR * sp * Math.cos(a), y: globeR * cp, z: globeR * sp * Math.sin(a) });
        }
        rings.push(pts);
      }
      for (let k = 0; k < 12; k += 1) {
        const lo = (k * 30 * Math.PI) / 180;
        const pts = [];
        for (let i = 0; i < 60; i += 1) {
          const a = (i / 60) * Math.PI;
          const sp2 = Math.sin(a);
          pts.push({
            x: globeR * sp2 * Math.cos(lo),
            y: globeR * Math.cos(a),
            z: globeR * sp2 * Math.sin(lo),
          });
        }
        rings.push(pts);
      }
      /* 球面点云：几百个均匀撒在球面上的小亮点，是"这是个球"最直接的证据——
         单看几条经纬线容易被当成平面网格，有点云才有体积。 */
      const dots = [];
      const DOT_N = 180;
      const gAngle = Math.PI * (1 + Math.sqrt(5));
      for (let i = 0; i < DOT_N; i += 1) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / DOT_N);
        const theta = gAngle * i;
        const sr2 = Math.sin(phi);
        dots.push({
          x: globeR * sr2 * Math.cos(theta),
          y: globeR * Math.cos(phi),
          z: globeR * sr2 * Math.sin(theta),
        });
      }
      const globe = { R: globeR, rings, dots };

      const byId = new Map();
      for (const g of galaxies) {
        byId.set(g.id, g);
        for (const p of g.planets) byId.set(p.id, p);
      }
      return { galaxies, planetIndex: byId, globe };
    }

    /* ---------------------------------------------------------------- locale */
    const DICT = {
      zh: {
        'panel.title': '星河视图',
        'panel.back': '返回对话',
        'mode.label': '会话互通',
        'mode.realtime': '实时推送',
        'mode.turn': '每轮摘要',
        'mode.off': '仅连线',
        'panel.subtitle': '{w} 个工作区 · {s} 个会话',
        'search.placeholder': '搜索工作区或会话（名字 / 拼音 / 首字母）',
        'search.empty': '没有匹配的工作区或会话',
        'search.workspace': '工作区',
        'search.session': '会话',
        'zoom.in': '放大',
        'zoom.out': '缩小',
        'zoom.reset': '重置视图',
        'zoom.fit': '全览',
        'state.running': '运行中',
        'state.pending': '等待审批',
        'state.archived': '已归档',
        'state.idle': '空闲',
        'card.open': '打开会话',
        'card.focus': '聚焦星系',
        'card.copy': '复制链接',
        'card.copyPath': '复制路径',
        'card.copyId': '复制会话 ID',
        'card.link': '链接到会话…',
        'card.pickTarget': '从列表选择链接目标…',
        'card.unlink': '删除连线',
        'card.sessions': '{n} 个会话',
        'card.recent': '最近活跃',
        'card.tokens': '累计 token',
        'card.path': '路径',
        'card.cwd': '工作目录',
        'link.hint': '点击另一个会话完成连线，Esc 取消',
        'link.pickTitle': '选择要链接的会话',
        'link.exists': '这两个会话已经连过了',
        'link.done': '已建立连线',
        'menu.open': '打开会话',
        'menu.focus': '聚焦这个星系',
        'menu.link': '链接到会话…',
        'menu.pick': '从列表选择链接目标…',
        'menu.removeLink': '删除这条连线',
        'menu.copyId': '复制会话 ID',
        'menu.copyPath': '复制工作区路径',
        'menu.close': '关闭菜单',
        'toast.copied': '已复制到剪贴板',
        'time.now': '刚刚',
        'time.min': '{n} 分钟前',
        'time.hour': '{n} 小时前',
        'time.day': '{n} 天前',
        'time.unknown': '—',
        'empty.title': '还没有工作区',
        'empty.body': '在工作区里开始一个会话，它就会成为这个星系里的一颗行星。',
      },
      en: {
        'panel.title': 'Galaxy View',
        'panel.back': 'Back to conversation',
        'mode.label': 'Session sync',
        'mode.realtime': 'Live push',
        'mode.turn': 'Per-turn digest',
        'mode.off': 'Links only',
        'panel.subtitle': '{w} workspaces · {s} sessions',
        'search.placeholder': 'Search workspaces or sessions (name / pinyin / initials)',
        'search.empty': 'No matching workspace or session',
        'search.workspace': 'Workspace',
        'search.session': 'Session',
        'zoom.in': 'Zoom in',
        'zoom.out': 'Zoom out',
        'zoom.reset': 'Reset view',
        'zoom.fit': 'Fit all',
        'state.running': 'Running',
        'state.pending': 'Waiting for approval',
        'state.archived': 'Archived',
        'state.idle': 'Idle',
        'card.open': 'Open session',
        'card.focus': 'Focus galaxy',
        'card.copy': 'Copy link',
        'card.copyPath': 'Copy path',
        'card.copyId': 'Copy session ID',
        'card.link': 'Link to session…',
        'card.pickTarget': 'Pick a link target…',
        'card.unlink': 'Remove link',
        'card.sessions': '{n} sessions',
        'card.recent': 'Last active',
        'card.tokens': 'Total tokens',
        'card.path': 'Path',
        'card.cwd': 'Working directory',
        'link.hint': 'Click another session to connect, Esc to cancel',
        'link.pickTitle': 'Pick a session to link',
        'link.exists': 'These two sessions are already linked',
        'link.done': 'Link created',
        'menu.open': 'Open session',
        'menu.focus': 'Focus this galaxy',
        'menu.link': 'Link to session…',
        'menu.pick': 'Pick a link target…',
        'menu.removeLink': 'Remove this link',
        'menu.copyId': 'Copy session ID',
        'menu.copyPath': 'Copy workspace path',
        'menu.close': 'Close menu',
        'toast.copied': 'Copied to clipboard',
        'time.now': 'just now',
        'time.min': '{n} min ago',
        'time.hour': '{n} h ago',
        'time.day': '{n} d ago',
        'time.unknown': '—',
        'empty.title': 'No workspaces yet',
        'empty.body': 'Start a session in a workspace and it becomes a planet here.',
      },
    };

    function makeT(lang) {
      const table = DICT[lang] || DICT.zh;
      return (key, params) => {
        let s = table[key] || DICT.zh[key] || key;
        if (params) {
          for (const k of Object.keys(params)) s = s.split('{' + k + '}').join(String(params[k]));
        }
        return s;
      };
    }

    function fmtCount(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return String(n);
    }

    /* 桌面壳（Tauri / Electron）可能在 WebView 上方叠一条自绘标题栏或原生菜单栏，
       面板要让开它的高度。优先量真实元素，量不到才退回按指纹估高。 */
    const measureTopInset = () => {
      try {
        const nodes = document.querySelectorAll('[data-tauri-drag-region], .titlebar, .app-titlebar, header[role="banner"]');
        let best = 0;
        for (const node of nodes) {
          const r = node.getBoundingClientRect();
          if (r.top <= 1 && r.bottom > 8 && r.bottom < 140 && r.width > 200) {
            best = Math.max(best, Math.round(r.bottom));
          }
        }
        if (best) return best;
      } catch {
        /* DOM 探测失败就走指纹 */
      }
      try {
        if (window.__TAURI_INTERNALS__ || /Tauri/i.test(navigator.userAgent || '')) return 32;
      } catch {
        /* 非桌面环境 */
      }
      /* Electron 默认用系统原生边框：webview 本身不含标题栏，不需要让位。
         若某个壳把标题栏画进了页面，上面的 DOM 探测会量到，不会走到这里。 */
      return 0;
    };
    const TOP_INSET = measureTopInset();

    /* ------------------------------------------------------------------- css */
    const CSS = `
.xgv-root {
  position: fixed; inset: 0; z-index: 900; display: flex; flex-direction: column;
  background: radial-gradient(120% 90% at 22% 8%, #101a3a 0%, #070b1c 42%, #03040c 100%);
  color: #dfe8ff; font-family: inherit; overflow: hidden; user-select: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.xgv-root.is-leaving { opacity: 0; transform: scale(1.035); }
.xgv-top {
  flex: 0 0 auto; height: 54px; display: flex; align-items: center; gap: 12px;
  padding: 0 16px; border-bottom: 1px solid rgba(120, 160, 255, 0.14);
  background: linear-gradient(180deg, rgba(10, 16, 36, 0.92), rgba(6, 10, 24, 0.55));
  backdrop-filter: blur(10px); z-index: 6;
}
.xgv-brand { flex: 0 0 auto; display: flex; align-items: center; gap: 9px; font-size: 14px; font-weight: 600; letter-spacing: 0.4px; color: #eaf1ff; white-space: nowrap; }
.xgv-brand small { font-weight: 400; font-size: 11.5px; color: rgba(168, 190, 235, 0.62); letter-spacing: 0; margin-left: 4px; }
.xgv-search { position: relative; flex: 1 1 auto; min-width: 120px; max-width: 520px; margin: 0 auto; }
.xgv-search input {
  width: 100%; height: 34px; box-sizing: border-box; padding: 0 12px 0 32px;
  border-radius: 9px; border: 1px solid rgba(120, 160, 255, 0.2);
  background: rgba(12, 20, 44, 0.72); color: #e6eeff; font-size: 13px; outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.xgv-search input::placeholder { color: rgba(150, 175, 220, 0.5); }
.xgv-search input:focus { border-color: rgba(120, 190, 255, 0.65); box-shadow: 0 0 0 3px rgba(80, 150, 255, 0.14); }
.xgv-search-icon { position: absolute; left: 10px; top: 9px; width: 15px; height: 15px; opacity: 0.55; pointer-events: none; }
.xgv-tools { flex: 0 0 auto; display: flex; align-items: center; gap: 4px; margin-left: auto; }
.xgv-mode {
  height: 30px; padding: 0 6px; border-radius: 8px; cursor: pointer;
  border: 1px solid rgba(120, 160, 255, 0.18); background: rgba(16, 26, 54, 0.7);
  color: #cfe0ff; font-size: 12px; outline: none;
}
.xgv-mode option { background: #0b1430; color: #cfe0ff; }
.xgv-btn {
  height: 30px; min-width: 30px; padding: 0 9px; border-radius: 8px; cursor: pointer;
  border: 1px solid rgba(120, 160, 255, 0.18); background: rgba(16, 26, 54, 0.7);
  color: #cfe0ff; font-size: 12px; display: inline-flex; align-items: center; justify-content: center;
}
.xgv-btn:hover { background: rgba(34, 52, 100, 0.9); border-color: rgba(120, 190, 255, 0.45); }
.xgv-zoomval { font-size: 11.5px; color: rgba(168, 190, 235, 0.7); min-width: 42px; text-align: center; }
.xgv-stage { position: relative; flex: 1 1 auto; overflow: hidden; cursor: grab; }
.xgv-stage.is-panning { cursor: grabbing; }
.xgv-stage.is-linking { cursor: crosshair; }
.xgv-svg { position: absolute; inset: 0; display: block; }
.xgv-star-label {
  fill: #f4ecff; font-size: 12.5px; font-weight: 600; text-anchor: middle;
  paint-order: stroke; stroke: rgba(4, 6, 16, 0.85); stroke-width: 3px; stroke-linejoin: round;
  pointer-events: none;
}
.xgv-planet-label {
  fill: rgba(206, 224, 255, 0.86); font-size: 10.5px;
  paint-order: stroke; stroke: rgba(4, 6, 16, 0.8); stroke-width: 2.6px; stroke-linejoin: round;
  pointer-events: none;
}
.xgv-planet { cursor: pointer; }
.xgv-stage[data-lod="far"] .xgv-planet-label { display: none; }
.xgv-planet:hover .xgv-planet-label,
.xgv-star:hover .xgv-star-label {
  display: block !important;
  opacity: 1 !important;
  paint-order: stroke;
  stroke: rgba(3, 6, 18, 0.95);
  stroke-width: 3px;
  stroke-linejoin: round;
}
.xgv-tip {
  position: fixed; z-index: 60; transform: translateY(-100%);
  padding: 4px 9px; border-radius: 7px;
  background: rgba(8, 14, 30, 0.94);
  border: 1px solid rgba(120, 190, 255, 0.3);
  color: #e8f1ff; font-size: 12px; line-height: 1.5;
  white-space: nowrap; pointer-events: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
}
.xgv-tip-state { margin-left: 7px; font-style: normal; font-size: 11px; opacity: 0.75; }
.xgv-planet.is-archived .xgv-planet-label { fill: rgba(150, 165, 195, 0.45); }
.xgv-link { pointer-events: stroke; cursor: pointer; }
.xgv-link:hover { stroke: rgba(180, 240, 255, 0.95); }
.xgv-results {
  position: absolute; z-index: 9; top: 46px; left: 0; width: 100%;
  max-height: 340px; overflow: auto; padding: 5px; box-sizing: border-box;
  border-radius: 11px; border: 1px solid rgba(120, 170, 255, 0.26);
  background: rgba(9, 14, 32, 0.97); box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
}
.xgv-result {
  display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 8px; cursor: pointer;
}
.xgv-result:hover, .xgv-result.is-active { background: rgba(46, 74, 138, 0.55); }
.xgv-result-dot { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; }
.xgv-result-title { font-size: 12.5px; color: #e8f0ff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.xgv-result-sub { font-size: 11px; color: rgba(150, 175, 220, 0.62); white-space: nowrap; }
.xgv-result-kind { margin-left: auto; font-size: 10px; padding: 1px 6px; border-radius: 5px; background: rgba(90, 130, 220, 0.22); color: rgba(180, 205, 255, 0.8); }
.xgv-none { padding: 14px 10px; font-size: 12px; color: rgba(150, 175, 220, 0.62); }
.xgv-card {
  position: absolute; z-index: 8; width: 322px; box-sizing: border-box; padding: 13px 14px;
  border-radius: 13px; border: 1px solid rgba(120, 170, 255, 0.3);
  background: linear-gradient(180deg, rgba(16, 24, 50, 0.98), rgba(9, 13, 30, 0.98));
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.62); backdrop-filter: blur(12px);
}
.xgv-card-head { display: flex; align-items: flex-start; gap: 8px; }
.xgv-card-title { font-size: 13.5px; font-weight: 600; color: #f0f6ff; line-height: 1.35; word-break: break-word; }
.xgv-card-x { margin-left: auto; cursor: pointer; color: rgba(160, 185, 230, 0.6); font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 5px; }
.xgv-card-x:hover { background: rgba(90, 120, 190, 0.3); color: #dfe8ff; }
.xgv-meta { margin-top: 9px; display: flex; flex-direction: column; gap: 5px; font-size: 11.5px; color: rgba(168, 190, 235, 0.8); }
.xgv-meta-row { display: flex; gap: 8px; }
.xgv-meta-key { flex: 0 0 66px; color: rgba(140, 165, 210, 0.66); }
.xgv-meta-val { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.xgv-tag { display: inline-flex; align-items: center; gap: 4px; padding: 1px 7px; border-radius: 20px; font-size: 10.5px; }
.xgv-tag.running { background: rgba(46, 200, 160, 0.18); color: #7ef1d0; }
.xgv-tag.pending { background: rgba(255, 200, 80, 0.18); color: #ffd166; }
.xgv-tag.archived { background: rgba(130, 145, 170, 0.2); color: #a9b6cc; }
.xgv-tag.idle { background: rgba(120, 160, 230, 0.16); color: #9fc6ff; }
.xgv-actions { margin-top: 11px; display: flex; flex-wrap: wrap; gap: 6px; }
.xgv-act {
  padding: 5px 10px; border-radius: 7px; font-size: 11.5px; cursor: pointer;
  border: 1px solid rgba(120, 160, 255, 0.26); background: rgba(28, 42, 82, 0.8); color: #d6e4ff;
}
.xgv-act:hover { background: rgba(48, 72, 136, 0.95); border-color: rgba(120, 190, 255, 0.55); }
.xgv-act.primary { background: linear-gradient(180deg, #2e6bd8, #2350af); border-color: #4f8bff; color: #fff; }
.xgv-act.primary:hover { background: linear-gradient(180deg, #3a7dee, #2b5fc7); }
.xgv-list { margin-top: 10px; max-height: 232px; overflow: auto; border-top: 1px solid rgba(120, 160, 255, 0.14); }
.xgv-row { display: flex; align-items: center; gap: 7px; padding: 6px 4px; border-radius: 6px; cursor: pointer; }
.xgv-row:hover { background: rgba(46, 74, 138, 0.45); }
.xgv-row-title { font-size: 11.8px; color: #dbe7ff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.xgv-row-time { margin-left: auto; font-size: 10px; color: rgba(150, 175, 220, 0.55); white-space: nowrap; }
.xgv-dot { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; }
.xgv-dot.running { background: #7ef1d0; box-shadow: 0 0 6px #7ef1d0; }
.xgv-dot.pending { background: #ffd166; box-shadow: 0 0 6px #ffd166; }
.xgv-dot.archived { background: #6b7a94; }
.xgv-dot.idle { background: #6f9bff; }
.xgv-menu {
  position: absolute; z-index: 10; min-width: 196px; padding: 5px; box-sizing: border-box;
  border-radius: 10px; border: 1px solid rgba(120, 170, 255, 0.28);
  background: rgba(10, 15, 34, 0.98); box-shadow: 0 18px 48px rgba(0, 0, 0, 0.6);
}
.xgv-menu-item { padding: 7px 10px; border-radius: 7px; font-size: 12.3px; color: #dbe7ff; cursor: pointer; white-space: nowrap; }
.xgv-menu-item:hover { background: rgba(52, 82, 152, 0.8); }
.xgv-menu-item.is-danger { color: #ff9a9a; }
.xgv-menu-item.is-danger:hover { background: rgba(150, 50, 60, 0.55); }
.xgv-menu-sep { height: 1px; margin: 4px 6px; background: rgba(120, 160, 255, 0.14); }
.xgv-hint {
  position: absolute; z-index: 11; left: 50%; top: 14px; transform: translateX(-50%);
  padding: 7px 14px; border-radius: 20px; font-size: 12px; white-space: nowrap;
  background: rgba(30, 70, 140, 0.94); border: 1px solid rgba(120, 190, 255, 0.5);
  color: #e8f2ff; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
}
.xgv-toast {
  position: absolute; z-index: 12; left: 50%; bottom: 18px; transform: translateX(-50%);
  padding: 6px 14px; border-radius: 18px; font-size: 11.5px;
  background: rgba(20, 34, 66, 0.95); border: 1px solid rgba(120, 170, 255, 0.34); color: #d6e4ff;
}
.xgv-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 0 24px; }
.xgv-empty b { font-size: 15px; color: #e6eeff; }
.xgv-empty span { font-size: 12.5px; color: rgba(160, 185, 230, 0.65); max-width: 340px; line-height: 1.6; }
@keyframes xgv-pulse { 0%, 100% { opacity: 0.72; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
.xgv-star-glow { animation: xgv-pulse 6.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.xgv-star-spin { transform-box: fill-box; transform-origin: center; animation: xgv-spin 64s linear infinite; }
.xgv-star-spin-b { animation-duration: 41s; animation-direction: reverse; }
.xgv-rays { animation: xgv-rays 9s ease-in-out infinite; }
@keyframes xgv-spin { to { transform: rotate(360deg); } }
@keyframes xgv-rays { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
@keyframes xgv-drift { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(1.6%, -1.2%, 0) scale(1.04); } 100% { transform: translate3d(0,0,0) scale(1); } }
.xgv-nebula { animation: xgv-drift 46s ease-in-out infinite; }
/* 星点各自闪烁：每颗的 --o 是它的峰值透明度，动画只在这个值上起伏。 */
.xgv-dustfield circle { animation: xgv-twinkle 7.5s ease-in-out infinite; }
@keyframes xgv-twinkle {
  0%, 100% { opacity: calc(var(--o, 0.4) * 0.25); }
  50% { opacity: var(--o, 0.4); }
}
`;

    /* ------------------------------------------------------------- component */
    function GalaxyPage(props) {
      const t = props.t;
      const wsSnap = props.useWorkspaces ? props.useWorkspaces(selAll) || EMPTY_WS : EMPTY_WS;
      const sessSnap = props.useSessions ? props.useSessions(selAll) || EMPTY_SESS : EMPTY_SESS;
      const statusSnap = props.useSessionStatus ? props.useSessionStatus(selAll) || EMPTY_STATUS : EMPTY_STATUS;

      const act = props.actions || {};

      const universe = useMemo(
        () => buildUniverse(wsSnap, sessSnap, statusSnap),
        [wsSnap, sessSnap, statusSnap],
      );
      const { galaxies, planetIndex, globe } = universe;

      /* 背景星点：屏幕空间的静态小圆点，靠 CSS 各自闪烁，不随相机移动。 */
      const dust = useMemo(() => {
        const out = [];
        for (let i = 0; i < 340; i += 1) {
          out.push({
            key: 'd' + i,
            x: (rnd01(i * 1.7 + 11) * 100).toFixed(2) + '%',
            y: (rnd01(i * 2.3 + 41) * 100).toFixed(2) + '%',
            r: (0.5 + rnd01(i * 3.7 + 7) * 1.4).toFixed(2),
            o: (0.16 + rnd01(i * 5.1 + 3) * 0.6).toFixed(2),
            d: (rnd01(i * 7.9 + 5) * 7.5).toFixed(2),
          });
        }
        return out;
      }, []);

      const sessionCount = useMemo(
        () => galaxies.reduce((n, g) => n + g.planets.length, 0),
        [galaxies],
      );

      const [box, setBox] = useState({ w: 1280, h: 820 });
      const [view] = useState({ x: 0, y: 0, k: 0.8 });
      const [panning, setPanning] = useState(false);
      const [query, setQuery] = useState('');
      const [activeResult, setActiveResult] = useState(0);
      const [card, setCard] = useState(null);
      const [menu, setMenu] = useState(null);
      const [hover, setHover] = useState(null);
      const [linkFrom, setLinkFrom] = useState(null);
      const [pickTarget, setPickTarget] = useState(null);
      const [toast, setToast] = useState('');
      const [links, setLinks] = useState(() => {
        try {
          const raw = window.localStorage.getItem(STORE_KEY);
          const arr = raw ? JSON.parse(raw) : [];
          return Array.isArray(arr) ? arr.filter((x) => Array.isArray(x) && x.length === 2) : [];
        } catch (e) {
          return [];
        }
      });
      /* 链接会话的互通方式：realtime=消息实时广播，turn=每轮注入最近动态，off=只看不读。 */
      const [mode, setMode] = useState(() => {
        try {
          const saved = window.localStorage.getItem(MODE_KEY);
          return saved === 'turn' || saved === 'off' ? saved : 'realtime';
        } catch (e) {
          return 'realtime';
        }
      });

      const stageRef = useRef(null);
      const planetRefs = useRef(new Map());
      const linkRefs = useRef(new Map());
      const positionsRef = useRef(new Map());
      const dragRef = useRef(null);
      const viewRef = useRef(view);
      const boxRef = useRef(box);
      const gesture = useRef(null);
      const movedRef = useRef(false);
      const fittedRef = useRef(false);
      const searchRef = useRef(null);
      /* 命令式相机：滚轮/拖拽只改 targetRef，rAF 每帧缓动并直接写 <g> 的 transform。
         之前每个 wheel 事件都 setView，整棵 React 树重渲染，缩放才一顿一顿。 */
      const camRef = useRef(null);
      /* 整体自转：相机绕当前视野中心缓慢旋转，像漂浮在太空里慢慢打转。
         spinRef 是 0..1 的起停缓动量：交互时归零，闲置后缓慢涨回 1。 */
      const spinRef = useRef(0);
      /* 3D 朝向：四元数轨迹球。拖动时朝"屏幕上的拖动方向"旋转，
         没有欧拉角的极点问题——转到球顶继续拖，方向也不会反过来。 */
      const quatRef = useRef(qIdentity());
      const quatTRef = useRef(qIdentity());
      /* 被聚焦的星系：id + 当时的世界坐标。放在 ref 里而不是星系对象上，
         因为会话数据一刷新 buildUniverse 就重建对象，挂在对象上的标记会丢。 */
      const holdRef = useRef(null);
      const lastActRef = useRef(0);
      /* 拖拽（尤其快速转圈）结束后浏览器仍可能补发 click/dblclick，
         落在行星上就会直接跳进会话，看起来像"崩回对话"。这段时间内一律忽略点击。 */
      const suppressRef = useRef(0);
      /* 恒星的贴图与光晕：每颗星按自己的相位缓慢自转、光晕呼吸。 */
      const starArtRef = useRef(new Map());
      /* 星系投影结果（屏幕坐标 + 深度缩放 s）：双击判定、连线、标签避让都读它。 */
      const screenRef = useRef(new Map());
      /* 球壳经纬线 + 球心：每帧把 3D 取样点投影成 path，整颗球的转动才看得出来。 */
      const globeRefs = useRef([]);
      const globeDotsRef = useRef({ far: null, near: null });
      const rimRef = useRef(null);
      const coreRef = useRef(null);
      /* 上一帧时间戳：恒星沿球面公转要靠真实 dt，不能写成每帧固定角速度。 */
      const prevTickRef = useRef(0);
      /* 正在拖动：视角在拖动期间直接跟手，不做缓动。 */
      const draggingRef = useRef(false);
      /* 每个星系的轨道环组：进动时每帧写一次 transform。 */
      const orbitRefs = useRef(new Map());
      /* 背景粒子层：canvas、2d 上下文、惰性构建的星场与 sprite。 */
      const bgRef = useRef(null);
      const bgCtxRef = useRef(null);
      const bgArtRef = useRef(null);
      const targetRef = useRef({ x: view.x, y: view.y, k: view.k });
      const easeRef = useRef(0.24);
      const zoomShownRef = useRef(Math.round(view.k * 100));
      const [zoomPct, setZoomPct] = useState(Math.round(view.k * 100));

      boxRef.current = box;

      /* size */
      useEffect(() => {
        const el = stageRef.current;
        if (!el) return undefined;
        const measure = () => {
          const r = el.getBoundingClientRect();
          setBox({ w: Math.max(280, Math.round(r.width)), h: Math.max(220, Math.round(r.height)) });
        };
        measure();
        let ro = null;
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(measure);
          ro.observe(el);
        }
        window.addEventListener('resize', measure);
        return () => {
          if (ro) ro.disconnect();
          window.removeEventListener('resize', measure);
        };
      }, []);

      /* 背景已回到最初那版：星云 + SVG 星点，不再有 canvas 粒子层，这段尺寸同步也一并去掉。 */

      /* 必须先于 fitAll 声明：fitAll 的依赖数组会立即求值这个绑定。 */
      /* 只改目标：缓动交给 rAF 的 lerp，不再自己 setView（整树重渲染会卡）。 */
      const animateView = useCallback((target, fromOverride, durOverride) => {
        if (fromOverride) viewRef.current = { x: fromOverride.x, y: fromOverride.y, k: fromOverride.k };
        easeRef.current = durOverride && durOverride > 900 ? 0.055 : 0.24;
        /* 程序化运镜（全景 / 聚焦 / 缩放按钮）也算交互，先停掉自转。 */
        lastActRef.current = performance.now();
        spinRef.current = 0;
        targetRef.current = { x: target.x, y: target.y, k: target.k };
      }, []);

      /* 解除聚焦：把球坐标角度反推回被钉住的那个点。
         不反推的话，公转循环会按冻结前的 theta 重算位置，星系当场瞬移一大段。 */
      const releaseHold = useCallback(() => {
        const held = holdRef.current;
        if (!held) return;
        const g = galaxies.find((x) => x.id === held.id);
        if (g && g.sph) g.sph.theta = Math.atan2(held.z, held.x);
        holdRef.current = null;
      }, [galaxies]);

      const fitAll = useCallback((intro) => {
        const gs = galaxies;
        if (!gs.length) return;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const g of gs) {
          minX = Math.min(minX, g.x - g.radius);
          minY = Math.min(minY, g.y - g.radius);
          maxX = Math.max(maxX, g.x + g.radius);
          maxY = Math.max(maxY, g.y + g.radius);
        }
        /* 星系铺在球面上，全览要按整颗球取景，否则转到侧面时边缘会被裁掉。 */
        if (globe && globe.R) {
          const R = globe.R * 1.08;
          minX = Math.min(minX, -R);
          maxX = Math.max(maxX, R);
          minY = Math.min(minY, -R);
          maxY = Math.max(maxY, R);
        }
        const b = boxRef.current;
        const bw = Math.max(1, maxX - minX);
        const bh = Math.max(1, maxY - minY);
        const k = clamp(Math.min((b.w - 90) / bw, (b.h - 90) / bh), 0.08, 1.5);
        const target = { x: 0, y: 0, k };
        /* 全景 = 回正视角，否则斜着看更容易把图撑出屏幕。 */
        quatTRef.current = qIdentity();
        /* 全景同时解除聚焦，让之前被按住的星系从当前位置接着公转。 */
        releaseHold();
        if (!intro) {
          viewRef.current = { x: target.x, y: target.y, k: target.k };
          targetRef.current = { x: target.x, y: target.y, k: target.k };
          easeRef.current = 0.24;
          return;
        }
        /* 入场：从极远处的深空推进到全景 */
        const start = { x: target.x, y: target.y, k: Math.max(0.02, k * 0.12) };
        animateView(target, start, 1600);
      }, [galaxies, globe, animateView, releaseHold]);

      /* 沉浸：进入星河视图时收起侧栏（今日费用等侧栏浮件随之消失），离开时恢复原状。 */
      useEffect(() => {
        const el = stageRef.current;
        if (!el || typeof act.toggleSidebar !== 'function') return undefined;
        let had = false;
        const id = window.requestAnimationFrame(() => {
          /* 侧栏展开时主面板整体右移，用 left 判断比算窗口宽度稳（Electron 的 webview 不一定占满窗口）。 */
          had = el.getBoundingClientRect().left > 100;
          if (had) act.toggleSidebar();
        });
        return () => {
          window.cancelAnimationFrame(id);
          if (had) act.toggleSidebar();
        };
      }, []);

      /* 只在 dsh-plugin-wallpaper-engine 开着壁纸时生效：进视图暂停它，离开恢复。 */
      useEffect(() => {
        setWallpaperPaused(true);
        return () => setWallpaperPaused(false);
      }, []);

      /* 桌面壳的标题栏可能晚于本模块挂载才布局，挂载后再测一次。 */
      const [topInset, setTopInset] = useState(TOP_INSET);
      useEffect(() => {
        const remeasure = () => setTopInset((prev) => {
          const next = measureTopInset();
          return next === prev ? prev : next;
        });
        remeasure();
        const timer = window.setTimeout(remeasure, 900);
        return () => window.clearTimeout(timer);
      }, []);

      useEffect(() => {
        if (fittedRef.current) return;
        if (!galaxies.length) return;
        if (box.w < 320) return;
        fittedRef.current = true;
        fitAll(true);
      }, [galaxies, box.w, box.h, fitAll]);

      /* wheel zoom (native, non-passive) */
      useEffect(() => {
        const el = stageRef.current;
        if (!el) return undefined;
        const onWheel = (e) => {
          e.preventDefault();
          lastActRef.current = performance.now();
          spinRef.current = 0;
          const t = targetRef.current;
          /* 球心锁死在屏幕正中：缩放只改比例、不产生平移，
             否则轴心会跟着指针跑，看起来就不是绕球心转。 */
          t.k = clamp(t.k * Math.exp(-e.deltaY * 0.0015), 0.06, 6);
          t.x = 0;
          t.y = 0;
          easeRef.current = 0.22;
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
      }, []);

      /* orbit animation */
      useEffect(() => {
        let raf = 0;
        const positions = positionsRef.current;
        let frameNo = 0;
        /* 同一星系里几十颗行星的标签会互相压住：按“越近越优先”做一次贪心避让，
           重叠的那个直接隐藏，缩放放大后自然会重新出现。 */
        const layoutLabels = () => {
          if (viewRef.current.k < 0.85) return;
          const placed = [];
          for (const g of galaxies) {
            for (const p of g.planets) {
              const el = planetRefs.current.get(p.id);
              if (!el) continue;
              const label = el.__label || (el.__label = el.querySelector('.xgv-planet-label'));
              if (!label) continue;
              const pos = positions.get(p.id);
              if (!pos) continue;
              const x = pos.x;
              const y = pos.y;
              /* 位置已是屏幕坐标，尺寸也要按 k × 深度缩放折算，否则近处标签算小了会互相压住。 */
              const sc = (screenRef.current.get(g.id) || { s: 1 }).s * viewRef.current.k;
              const w = Math.min(p.title.length, 16) * 7.4 * sc + 10;
              const bx = x + p.size * sc + 5;
              const by = y - 6 * sc;
              const h = 12 * sc;
              let hit = false;
              for (const b of placed) {
                if (bx < b.x + b.w && bx + w > b.x && by < b.y + b.h && by + h > b.y) {
                  hit = true;
                  break;
                }
              }
              if (!hit) placed.push({ x: bx, y: by, w, h });
              const next = hit ? 'none' : '';
              if (label.style.display !== next) label.style.display = next;
            }
          }
        };
        const tick = (now) => {
          /* rAF 时间戳是页面加载起的绝对时间：effect 因数据刷新重跑时角度不会归零，
             不会再出现「转一段就跳回起点」。（原先用 effect 内的 start 做零点。） */
          const tsec = now / 1000;
          /* 相机：向 target 缓动，然后把 transform 直接写到 <g> 上（不经 React）。 */
          const cam = camRef.current;
          if (cam) {
            /* 闲置 0.9 秒后开始自转；一旦有操作立即冻结（不是慢慢停）。
               交互期间角度必须恒定，否则滚轮锚点和拖拽方向会跟着角度漂。
               0.0016 rad/帧 ≈ 5.5°/秒，约 65 秒一圈。 */
            /* 聚焦状态下不要待机自转：球在转、被聚焦的星系不转，它就会从正中心漂走。 */
            const wantSpin = now - lastActRef.current > 900 && !holdRef.current ? 1 : 0;
            if (wantSpin === 0) spinRef.current = 0;
            else spinRef.current += (1 - spinRef.current) * 0.045;
            /* 闲置时让整颗球极慢自转（绕世界竖轴），像漂浮在太空里慢慢打转。
               一交互 spinRef 归零，转动立刻停下，不跟手抢方向。 */
            if (spinRef.current > 0.002) {
              const autoAng = 0.00026 * spinRef.current; // 每帧，约 0.016 rad/s
              quatTRef.current = qMul(qAxis(0, 1, 0, autoAng), quatTRef.current);
            }
            const tv = targetRef.current;
            const cv = viewRef.current;
            const b0 = boxRef.current;
            const ease = easeRef.current;
            cv.k += (tv.k - cv.k) * ease;
            /* 球心锁死在屏幕正中：相机平移恒为 0，只剩缩放会变。 */
            cv.x = 0;
            cv.y = 0;
            tv.x = 0;
            tv.y = 0;
            /* 拖动期间视角必须跟手（缓动=1），否则会有"拖着一块湿海绵"的滞后感；
               松手后才恢复缓动，让最后一小段滑顺地补上。 */
            const easeView = draggingRef.current ? 1 : 0.22;
            quatRef.current = qNlerp(quatRef.current, quatTRef.current, easeView);
            if (Math.abs(tv.k - cv.k) < 0.0006) cv.k = tv.k;
            /* 一帧一次的姿态矩阵：下面上千个点共用，避免每点重建 3×3 数组。 */
            const qm = qMat(quatRef.current);
            /* 3D：每个星系先投影成屏幕坐标，再按深度缩放 s 写到自己的组上。
               cam 组本身不再做变换——所有位置都在投影里算完，连线因此能直接用屏幕坐标。 */
            cam.setAttribute('transform', '');
            /* 球壳经纬线与球心：和星系用同一套投影，所以整颗球是一起转的。 */
            for (let i = 0; i < globe.rings.length; i += 1) {
              const slot = globeRefs.current[i];
              if (!slot) continue;
              const pts = globe.rings[i];
              let far = '';
              let near = '';
              let pen = false;
              for (let j = 0; j < pts.length; j += 1) {
                const q = pts[j];
                const pp = projectMat(qm, q.x, q.y, q.z, cv, cv.k, b0.w, b0.h);
                const sx = pp.x.toFixed(1) + ' ' + pp.y.toFixed(1);
                far += (j ? 'L' : 'M') + sx;
                if (pp.z <= 0) {
                  near += (pen ? 'L' : 'M') + sx;
                  pen = true;
                } else {
                  pen = false;
                }
              }
              if (slot.far) slot.far.setAttribute('d', far + 'Z');
              if (slot.near) slot.near.setAttribute('d', near);
            }
            /* 球面点云：几百个亮点让"球"有体积，同样拆成远/近两层。 */
            if (globe.dots && globeDotsRef.current) {
              let far = '';
              let near = '';
              let pen = false;
              for (let i = 0; i < globe.dots.length; i += 1) {
                const q = globe.dots[i];
                const pp = projectMat(qm, q.x, q.y, q.z, cv, cv.k, b0.w, b0.h);
                const rr = (0.85 + pp.s * 0.55).toFixed(2);
                const stamp =
                  'M' + (pp.x - rr).toFixed(1) + ' ' + pp.y.toFixed(1) +
                  'a' + rr + ' ' + rr + ' 0 1 0 ' + (2 * rr).toFixed(2) + ' 0' +
                  'a' + rr + ' ' + rr + ' 0 1 0 ' + (-2 * rr).toFixed(2) + ' 0';
                far += stamp;
                if (pp.z <= 0) {
                  near += stamp;
                  pen = true;
                } else {
                  pen = false;
                }
              }
              if (globeDotsRef.current.far) globeDotsRef.current.far.setAttribute('d', far);
              if (globeDotsRef.current.near) globeDotsRef.current.near.setAttribute('d', near);
            }
            /* 边缘光：球在正交投影下永远是圆，半径 = R * k * s，画一圈淡蓝把轮廓托出来。 */
            /* 球心只投影一次，边缘光与球心共用，别算两遍。 */
            const pc0 = projectMat(qm, 0, 0, 0, cv, cv.k, b0.w, b0.h);
            if (rimRef.current) {
              rimRef.current.setAttribute('cx', pc0.x.toFixed(1));
              rimRef.current.setAttribute('cy', pc0.y.toFixed(1));
              rimRef.current.setAttribute('r', Math.max(1, globe.R * cv.k * pc0.s).toFixed(1));
            }
            if (coreRef.current) {
              coreRef.current.setAttribute('transform', 'translate(' + pc0.x.toFixed(1) + ' ' + pc0.y.toFixed(1) + ') scale(' + pc0.s.toFixed(3) + ')');
            }
            /* 恒星沿球面缓缓公转：每颗有自己的角速度，位置从球坐标实时重算。
               用真实 dt，掉帧时不会突然跳一大步。 */
            const prevT = prevTickRef.current || now;
            const dtG = Math.min(0.12, Math.max(0, (now - prevT) / 1000));
            prevTickRef.current = now;
            const held = holdRef.current;
            for (const g of galaxies) {
              if (!g.sph) continue;
              /* 被聚焦的星系钉在记下的位置上，其余照常公转。 */
              if (held && held.id === g.id) {
                g.x = held.x;
                g.y = held.y;
                g.z = held.z;
                continue;
              }
              g.sph.theta += g.sph.w * dtG;
              const sr = Math.sin(g.sph.phi);
              g.x = globe.R * sr * Math.cos(g.sph.theta);
              g.y = globe.R * Math.cos(g.sph.phi);
              g.z = globe.R * sr * Math.sin(g.sph.theta);
            }
            for (const g of galaxies) {
              const pr = projectMat(qm, g.x, g.y, g.z, cv, cv.k, b0.w, b0.h);
              screenRef.current.set(g.id, pr);
              const fog = clamp(1.3 - pr.z / 2600, 0.18, 1);
              const og = orbitRefs.current.get(g.id);
              if (og) {
                const inc = g.inc + g.prec * tsec;
                og.setAttribute('transform', 'translate(' + pr.x.toFixed(2) + ' ' + pr.y.toFixed(2) + ') scale(' + pr.s.toFixed(4) + ') rotate(' + (inc * 57.29578).toFixed(2) + ')');
                og.setAttribute('opacity', (fog * 0.9).toFixed(3));
              }
              const art = starArtRef.current.get(g.id);
              if (art && art.el) {
                art.el.setAttribute('transform', 'translate(' + pr.x.toFixed(2) + ' ' + pr.y.toFixed(2) + ') scale(' + pr.s.toFixed(4) + ')');
                art.el.setAttribute('opacity', fog.toFixed(3));
              }
            }
            const pct = Math.round(cv.k * 100);
            if (pct !== zoomShownRef.current) {
              zoomShownRef.current = pct;
              setZoomPct(pct);
            }
          }
          const stageEl = stageRef.current;
          if (stageEl) {
            /* 缩得太小时行星名会糊成一团：远景只保留恒星名。 */
            const lod = viewRef.current.k < 0.85 ? 'far' : 'near';
            if (stageEl.dataset.lod !== lod) stageEl.dataset.lod = lod;
          }
          /* 背景已回到最初那版：纯 SVG 星云 + 闪烁星点，不再跑 canvas 粒子层。 */
          /* 恒星自身的自转与光晕呼吸：贴图绕自身中心缓缓转，光晕按各自相位起伏。
             直接写属性，不经 React——16 颗星每帧几十次 setAttribute，可忽略。 */
          for (const art of starArtRef.current.values()) {
            if (art.img) {
              art.img.setAttribute('transform', 'rotate(' + ((tsec * art.spin * 57.29578) % 360).toFixed(2) + ')');
            }
            if (art.aura) {
              const wave = Math.sin(tsec * 0.45 + art.phase);
              art.aura.setAttribute('r', (art.base * (1 + 0.07 * wave)).toFixed(1));
              art.aura.setAttribute('opacity', (0.6 + 0.3 * wave).toFixed(3));
            }
          }
          frameNo += 1;
          positions.clear();
          for (const g of galaxies) {
            /* 轨道平面整体进动：先转轨道环，行星按同一角度落到倾斜椭圆上。 */
            const inc = g.inc + g.prec * tsec;
            const pr = screenRef.current.get(g.id);
            if (!pr) continue;
            const ca = Math.cos(inc);
            const sa = Math.sin(inc);
            for (const p of g.planets) {
              const ang = p.a0 + p.speed * tsec;
              const ex = Math.cos(ang) * p.r;
              const ey = Math.sin(ang) * p.r * g.tilt;
              /* 局部轨道坐标 → 乘深度缩放 → 加到星系的屏幕位置；连线直接吃屏幕坐标。 */
              const lx = ex * ca - ey * sa;
              const ly = ex * sa + ey * ca;
              const x = pr.x + lx * pr.s;
              const y = pr.y + ly * pr.s;
              positions.set(p.id, { x, y });
              const el = planetRefs.current.get(p.id);
              if (el) el.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + pr.s.toFixed(4) + ')');
            }
          }
          for (const path of linkRefs.current.values()) {
            const pair = path.__pair;
            if (!pair) continue;
            const a = positions.get(pair[0]);
            const b = positions.get(pair[1]);
            if (!a || !b) continue;
            const ax = a.x;
            const ay = a.y;
            const bx = b.x;
            const by = b.y;
            const dx = bx - ax;
            const dy = by - ay;
            const d = Math.hypot(dx, dy) || 1;
            const bend = Math.min(90, d * 0.16);
            const mx = (ax + bx) / 2 - (dy / d) * bend;
            const my = (ay + by) / 2 + (dx / d) * bend;
            path.setAttribute('d', 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1));
          }
          if (frameNo % 8 === 0) layoutLabels();
          raf = window.requestAnimationFrame(tick);
        };
        if (galaxies.length) raf = window.requestAnimationFrame(tick);
        return () => {
          if (raf) window.cancelAnimationFrame(raf);
        };
      }, [galaxies]);

      /* ---------- view helpers ---------- */
      /* 屏幕偏移 → 世界偏移。相机已无 matrix/roll，只有 yaw/pitch 带来的水平/垂直压缩，
         z≈0 平面上除以 cos 即可，够 Shift 平移与拖拽建线用。 */
      const screenDeltaToWorld = useCallback((dx, dy, k) => {
        /* 相机朝向用四元数的矩阵转置做逆变换，z≈0 平面上够用。 */
        const m = qMat(quatRef.current);
        const px = dx / k;
        const py = dy / k;
        return { x: m[0] * px + m[3] * py, y: m[1] * px + m[4] * py };
      }, []);

      const toWorld = useCallback((sx, sy) => {
        const b = boxRef.current;
        const v = viewRef.current;
        const off = screenDeltaToWorld(sx - b.w / 2, sy - b.h / 2, v.k);
        return { x: v.x + off.x, y: v.y + off.y };
      }, [screenDeltaToWorld]);

      const stagePoint = useCallback((clientX, clientY) => {
        const rect = stageRef.current ? stageRef.current.getBoundingClientRect() : { left: 0, top: 0 };
        return { x: clientX - rect.left, y: clientY - rect.top };
      }, []);

      const focusGalaxy = useCallback((gid) => {
        const g = galaxies.find((x) => x.id === gid);
        if (!g) return;
        const b = boxRef.current;
        const span = Math.max(120, g.radius * 2.1);
        /* 上限 1.3：星系半径小的时候会算到 5 以上，恒星光点会糊满整屏。 */
        const k = clamp(Math.min(b.w / span, b.h / span), 0.12, 1.3);
        /* 聚焦 = 把这颗星系转到正前方（绕球心转视角），而不是平移视野——
           球心因此始终停在屏幕正中。qFromTo 给出把它转到 (0,0,-1) 的最小旋转。 */
        quatTRef.current = qFromTo([g.x, g.y, g.z], [0, 0, -1]);
        /* 聚焦期间让这颗星系停在球面上不再公转，否则它会继续绕球心走，
           几秒后就从正中心飘走。位置记在 holdRef 里，数据刷新重建后仍然钉住。 */
        releaseHold();
        holdRef.current = { id: g.id, x: g.x, y: g.y, z: g.z };
        animateView({ x: 0, y: 0, k });
        setCard(null);
        setMenu(null);
      }, [galaxies, animateView, releaseHold]);

      /* ---------- persistence ---------- */
      const linksRef = useRef(links);
      linksRef.current = links;
      const modeRef = useRef(mode);
      modeRef.current = mode;

      /* delta 给的是「这一次新增/删掉了哪几条」：多窗口同时开着时，各自只上报自己动过的那几条，
         不会像整份 pairs 那样把别人刚加的线覆盖掉。delta 为空才退回整份同步。 */
      const saveLinks = useCallback((next, delta) => {
        setLinks(next);
        try {
          window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
        } catch (e) {
          /* storage unavailable: keep the in-memory graph */
        }
        try {
          const body = delta
            ? { add: delta.add || [], remove: delta.remove || [], settings: { mode: modeRef.current } }
            : { pairs: next, settings: { mode: modeRef.current } };
          window
            .fetch('/xinghe/links', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            })
            .catch(() => {});
        } catch (e) {
          /* host sync is best-effort */
        }
      }, []);

      const changeMode = useCallback((next) => {
        setMode(next);
        try {
          window.localStorage.setItem(MODE_KEY, next);
        } catch (e) {
          /* ignore */
        }
        try {
          window
            .fetch('/xinghe/links', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ pairs: linksRef.current, settings: { mode: next } }),
            })
            .catch(() => {});
        } catch (e) {
          /* host sync is best-effort */
        }
      }, []);

      /* pull links the host already knows (survives a cleared browser store) */
      useEffect(() => {
        let alive = true;
        const merge = (remote) => {
          if (!Array.isArray(remote) || !remote.length) return;
          setLinks((cur) => {
            const known = new Set(cur.map(([a, b]) => (a < b ? a + '|' + b : b + '|' + a)));
            const next = cur.slice();
            for (const pair of remote) {
              if (!Array.isArray(pair) || pair.length !== 2) continue;
              const [a, b] = pair;
              if (!a || !b || a === b) continue;
              const key = a < b ? a + '|' + b : b + '|' + a;
              if (known.has(key)) continue;
              known.add(key);
              next.push([a, b]);
            }
            if (next.length === cur.length) return cur;
            try {
              window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
            } catch (e) {
              /* keep the merged graph in memory */
            }
            return next;
          });
        };
        try {
          window
            .fetch('/xinghe/links')
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (!alive || !data) return;
              merge(data.pairs);
              /* 浏览器没存过模式时跟随宿主的设置（换设备/清缓存后仍一致）。 */
              let saved = null;
              try {
                saved = window.localStorage.getItem(MODE_KEY);
              } catch (e) {
                saved = null;
              }
              const remoteMode = data.settings && data.settings.mode;
              if (!saved && (remoteMode === 'realtime' || remoteMode === 'turn' || remoteMode === 'off')) {
                setMode(remoteMode);
              }
            })
            .catch(() => {});
        } catch (e) {
          /* offline: local graph stands alone */
        }
        return () => {
          alive = false;
        };
      }, []);

      const hasLink = useCallback(
        (a, b) => links.some(([x, y]) => (x === a && y === b) || (x === b && y === a)),
        [links],
      );

      const addLink = useCallback((a, b) => {
        if (!a || !b || a === b) return false;
        if (hasLink(a, b)) {
          setToast(t('link.exists'));
          window.setTimeout(() => setToast(''), 1800);
          return false;
        }
        saveLinks(links.concat([[a, b]]), { add: [[a, b]] });
        setToast(t('link.done'));
        window.setTimeout(() => setToast(''), 1500);
        return true;
      }, [links, hasLink, saveLinks, t]);

      const removeLink = useCallback((a, b) => {
        const next = links.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a)));
        saveLinks(next, { remove: [[a, b]] });
        setMenu(null);
      }, [links, saveLinks]);

      /* ---------- actions ---------- */
      const openSession = useCallback((sid) => {
        setCard(null);
        setMenu(null);
        setPickTarget(null);
        if (act.openSession) act.openSession(sid);
      }, [act]);

      const copyText = useCallback((text) => {
        if (act.copy) {
          act.copy(text);
          setToast(t('toast.copied', {}));
          window.setTimeout(() => setToast(''), 1400);
          return;
        }
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
        } catch (e) {
          /* clipboard can be denied; the menu simply closes */
        }
        setToast(t('toast.copied'));
        window.setTimeout(() => setToast(''), 1400);
      }, [act, t]);

      const showSessionCard = useCallback((sid, clientX, clientY) => {
        const p = planetIndex.get(sid);
        if (!p) return;
        const pt = stagePoint(clientX, clientY);
        setMenu(null);
        setCard({ kind: 'session', id: sid, x: pt.x, y: pt.y });
      }, [planetIndex, stagePoint]);

      const showGalaxyCard = useCallback((gid, clientX, clientY) => {
        const pt = stagePoint(clientX, clientY);
        setMenu(null);
        setCard({ kind: 'galaxy', id: gid, x: pt.x, y: pt.y });
      }, [stagePoint]);

      /* ---------- pointer gestures ---------- */
      const onPointerDown = useCallback((e) => {
        if (e.button !== 0) return;
        const target = e.target;
        const sessEl = target && target.closest ? target.closest('[data-session]') : null;
        const pt = stagePoint(e.clientX, e.clientY);
        lastActRef.current = performance.now();
        spinRef.current = 0;
        movedRef.current = false;
        if (sessEl) {
          gesture.current = { type: 'planet', id: sessEl.getAttribute('data-session'), sx: pt.x, sy: pt.y, vx: viewRef.current.x, vy: viewRef.current.y };
        } else {
          gesture.current = { type: 'pan', sx: pt.x, sy: pt.y, lx: pt.x, ly: pt.y, vx: viewRef.current.x, vy: viewRef.current.y, axis: null };
        }
      }, [stagePoint]);

      const onPointerMove = useCallback((e) => {
        const g = gesture.current;
        if (!g) return;
        const pt = stagePoint(e.clientX, e.clientY);
        const dx = pt.x - g.sx;
        const dy = pt.y - g.sy;
        if (!movedRef.current && Math.hypot(dx, dy) > 8) {
          movedRef.current = true;
          if (g.type === 'pan') setPanning(true);
          try {
            if (stageRef.current && stageRef.current.setPointerCapture) stageRef.current.setPointerCapture(e.pointerId);
          } catch (err) {
            /* pointer capture is best effort, only needed once dragging */
          }
        }
        if (!movedRef.current) return;
        if (g.type === 'pan') {
          /* 拖动 = 3D 旋转。
             这里是**帧间增量**（ddx/ddy），不是相对按下点的累计位移——
            之前误用累计值再乘系数，位移会被每秒重复叠加几十次，
             所以拖一小段就转好几圈；改成增量后，转多少完全由手移动的距离决定。
             轴向锁定：手势开始时先看主方向，锁定后本次拖动只转一个轴。
             灵敏度 0.0012 rad/px：拖满一屏约转 60°。 */
          const ddx = pt.x - (typeof g.lx === 'number' ? g.lx : pt.x);
          const ddy = pt.y - (typeof g.ly === 'number' ? g.ly : pt.y);
          g.lx = pt.x;
          g.ly = pt.y;
          draggingRef.current = true;
          /* 轨迹球：位移直接变成"绕屏幕轴"的旋转，横竖斜都是一个公式，
             不再需要轴向锁定——斜着拖就是斜着转，方向也不会因为转到另一侧而反。
             轴 = (dy, dx, 0) 在屏幕空间，角度 = 位移长度 × 灵敏度。 */
          const dist = Math.hypot(ddx, ddy);
          if (dist > 0.01) {
            const ang = dist * 0.0012;
            const ax = ddy / dist;
            const ay = -ddx / dist;
            const qd = qMul(
              qAxis(0, 1, 0, ay * ang),
              qAxis(1, 0, 0, ax * ang),
            );
            quatTRef.current = qMul(qd, quatTRef.current);
          }
        } else if (g.type === 'planet') {
          const line = dragRef.current;
          const from = positionsRef.current.get(g.id);
          if (line && from) {
            /* positions 已经是屏幕坐标，连线也在屏幕空间画，直接用指针位置。 */
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', String(pt.x));
            line.setAttribute('y2', String(pt.y));
            line.style.display = 'inline';
          }
        }
      }, [stagePoint, toWorld, screenDeltaToWorld]);

      const endGesture = useCallback((e) => {
        const g = gesture.current;
        gesture.current = null;
        draggingRef.current = false;
        setPanning(false);
        if (!g) return;
        if (movedRef.current) suppressRef.current = performance.now() + 400;
        if (g.type === 'planet' && movedRef.current && e) {
          const under = document.elementFromPoint(e.clientX, e.clientY);
          const sessEl = under && under.closest ? under.closest('[data-session]') : null;
          const to = sessEl && sessEl.getAttribute('data-session');
          if (to && to !== g.id) addLink(g.id, to);
        }
        if (dragRef.current) dragRef.current.style.display = 'none';
        window.setTimeout(() => { movedRef.current = false; }, 0);
      }, [addLink]);

      /* ---------- keyboard ---------- */
      useEffect(() => {
        const onKey = (e) => {
          if (e.key === 'Escape') {
            if (linkFrom) setLinkFrom(null);
            else if (pickTarget) setPickTarget(null);
            else if (menu) setMenu(null);
            else if (card) setCard(null);
            else if (query) setQuery('');
            return;
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (searchRef.current) searchRef.current.focus();
          }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [linkFrom, pickTarget, menu, card, query]);

      /* ---------- search ---------- */
      const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase().replace(/\s+/g, '');
        if (!q) return [];
        const out = [];
        for (const g of galaxies) {
          const s1 = scoreMatch(g.title, q);
          const s2 = scoreMatch(g.path, q);
          const score = Math.max(s1, s2 * 0.8);
          if (score > 0) out.push({ kind: 'galaxy', id: g.id, title: g.title, sub: g.path, score: score + 6, count: g.planets.length });
          for (const p of g.planets) {
            const sp = scoreMatch(p.title, q);
            if (sp > 0) out.push({ kind: 'session', id: p.id, title: p.title, sub: g.title, score: sp, state: p.state });
          }
        }
        out.sort((a, b) => b.score - a.score);
        return out.slice(0, 24);
      }, [query, galaxies]);

      useEffect(() => { setActiveResult(0); }, [query]);

      const chooseResult = useCallback((item) => {
        if (!item) return;
        setQuery('');
        if (item.kind === 'galaxy') focusGalaxy(item.id);
        else openSession(item.id);
      }, [focusGalaxy, openSession]);

      const onSearchKey = useCallback((e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveResult((i) => Math.min(searchResults.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveResult((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          chooseResult(searchResults[activeResult]);
        }
      }, [searchResults, activeResult, chooseResult]);

      /* ---------- render helpers ---------- */
      const renderCard = () => {
        if (!card) return null;
        const left = Math.max(8, Math.min(card.x + 16, box.w - 340));
        const top = Math.max(8, Math.min(card.y + 14, box.h - 240));
        if (card.kind === 'session') {
          const p = planetIndex.get(card.id);
          if (!p) return null;
          const g = galaxies.find((x) => x.id === p.groupId);
          const usage = p.summary && p.summary.projectionValues && p.summary.projectionValues.tokenUsage;
          const total = usage ? usage.uncachedInputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens : 0;
          const stateLabel = t('state.' + p.state);
          return h('div', { key: 'card', className: 'xgv-card', style: { left, top }, onClick: (e) => e.stopPropagation() }, [
            h('div', { key: 'head', className: 'xgv-card-head' }, [
              h('div', { key: 'title', className: 'xgv-card-title' }, p.title),
              h('div', { key: 'x', className: 'xgv-card-x', onClick: () => setCard(null) }, '\u00d7'),
            ]),
            h('div', { key: 'meta', className: 'xgv-meta' }, [
              h('div', { key: 'st', className: 'xgv-meta-row' }, [
                h('div', { key: 'k', className: 'xgv-meta-key' }, ''),
                h('div', { key: 'v', className: 'xgv-meta-val' }, [
                  h('span', { key: 'tag', className: 'xgv-tag ' + p.state }, stateLabel),
                ]),
              ]),
              h('div', { key: 'ws', className: 'xgv-meta-row' }, [
                h('div', { key: 'k', className: 'xgv-meta-key' }, t('search.workspace')),
                h('div', { key: 'v', className: 'xgv-meta-val', title: g ? g.path : '' }, g ? g.title : '—'),
              ]),
              h('div', { key: 'time', className: 'xgv-meta-row' }, [
                h('div', { key: 'k', className: 'xgv-meta-key' }, t('card.recent')),
                h('div', { key: 'v', className: 'xgv-meta-val' }, fmtRel(p.updatedAt, t)),
              ]),
              h('div', { key: 'tok', className: 'xgv-meta-row' }, [
                h('div', { key: 'k', className: 'xgv-meta-key' }, t('card.tokens')),
                h('div', { key: 'v', className: 'xgv-meta-val' }, total ? fmtCount(total) : '—'),
              ]),
              h('div', { key: 'id', className: 'xgv-meta-row' }, [
                h('div', { key: 'k', className: 'xgv-meta-key' }, 'ID'),
                h('div', { key: 'v', className: 'xgv-meta-val', title: p.id }, p.id.slice(0, 14)),
              ]),
            ]),
            h('div', { key: 'acts', className: 'xgv-actions' }, [
              h('div', { key: 'open', className: 'xgv-act primary', onClick: () => openSession(p.id) }, t('card.open')),
              h('div', { key: 'link', className: 'xgv-act', onClick: () => { setLinkFrom(p.id); setCard(null); } }, t('card.link')),
              h('div', { key: 'pick', className: 'xgv-act', onClick: () => { setPickTarget(p.id); setCard(null); } }, t('card.pickTarget')),
              hasLinkAny(p.id) ? h('div', { key: 'un', className: 'xgv-act', onClick: () => { const other = links.find(([a, b]) => a === p.id || b === p.id); if (other) removeLink(other[0], other[1]); } }, t('card.unlink')) : null,
            ]),
          ]);
        }
        const g = galaxies.find((x) => x.id === card.id);
        if (!g) return null;
        return h('div', { key: 'card', className: 'xgv-card', style: { left, top }, onClick: (e) => e.stopPropagation() }, [
          h('div', { key: 'head', className: 'xgv-card-head' }, [
            h('div', { key: 'title', className: 'xgv-card-title' }, g.title),
            h('div', { key: 'x', className: 'xgv-card-x', onClick: () => setCard(null) }, '\u00d7'),
          ]),
          h('div', { key: 'meta', className: 'xgv-meta' }, [
            h('div', { key: 'cnt', className: 'xgv-meta-row' }, [
              h('div', { key: 'k', className: 'xgv-meta-key' }, t('search.workspace')),
              h('div', { key: 'v', className: 'xgv-meta-val' }, t('card.sessions', { n: g.planets.length })),
            ]),
            h('div', { key: 'path', className: 'xgv-meta-row' }, [
              h('div', { key: 'k', className: 'xgv-meta-key' }, t('card.path')),
              h('div', { key: 'v', className: 'xgv-meta-val', title: g.path }, g.path || '—'),
            ]),
          ]),
          h('div', { key: 'acts', className: 'xgv-actions' }, [
            h('div', { key: 'focus', className: 'xgv-act primary', onClick: () => focusGalaxy(g.id) }, t('card.focus')),
            h('div', { key: 'copy', className: 'xgv-act', onClick: () => copyText(g.path || g.title) }, t('card.copyPath')),
          ]),
          h('div', { key: 'list', className: 'xgv-list' },
            g.planets.slice(0, 60).map((p) =>
              h('div', { key: p.id, className: 'xgv-row', onClick: () => openSession(p.id) }, [
                h('span', { key: 'd', className: 'xgv-dot ' + p.state }),
                h('span', { key: 't', className: 'xgv-row-title' }, p.title),
                h('span', { key: 's', className: 'xgv-row-time' }, fmtRel(p.updatedAt, t)),
              ]),
            ),
          ),
        ]);
      };

      const hasLinkAny = (sid) => links.some(([a, b]) => a === sid || b === sid);

      const renderMenu = () => {
        if (!menu) return null;
        const left = Math.max(8, Math.min(menu.x, box.w - 220));
        const top = Math.max(8, Math.min(menu.y, box.h - 220));
        const items = [];
        if (menu.kind === 'session') {
          const p = planetIndex.get(menu.id);
          if (!p) return null;
          items.push(h('div', { key: 'open', className: 'xgv-menu-item', onClick: () => openSession(p.id) }, t('menu.open')));
          items.push(h('div', { key: 'link', className: 'xgv-menu-item', onClick: () => { setLinkFrom(p.id); setMenu(null); } }, t('menu.link')));
          items.push(h('div', { key: 'pick', className: 'xgv-menu-item', onClick: () => { setPickTarget(p.id); setMenu(null); } }, t('menu.pick')));
          items.push(h('div', { key: 'sep', className: 'xgv-menu-sep' }));
          if (hasLinkAny(p.id)) {
            items.push(h('div', { key: 'rm', className: 'xgv-menu-item is-danger', onClick: () => { const other = links.find(([a, b]) => a === p.id || b === p.id); if (other) removeLink(other[0], other[1]); } }, t('menu.removeLink')));
          }
          items.push(h('div', { key: 'cid', className: 'xgv-menu-item', onClick: () => { copyText(p.id); setMenu(null); } }, t('menu.copyId')));
        } else if (menu.kind === 'galaxy') {
          items.push(h('div', { key: 'focus', className: 'xgv-menu-item', onClick: () => focusGalaxy(menu.id) }, t('menu.focus')));
          items.push(h('div', { key: 'cp', className: 'xgv-menu-item', onClick: () => { copyText(menu.path || ''); setMenu(null); } }, t('menu.copyPath')));
        } else if (menu.kind === 'link') {
          items.push(h('div', { key: 'rm', className: 'xgv-menu-item is-danger', onClick: () => removeLink(menu.a, menu.b) }, t('menu.removeLink')));
        }
        return h('div', { key: 'menu', className: 'xgv-menu', style: { left, top }, onClick: (e) => e.stopPropagation() }, items);
      };

      const renderPicker = () => {
        if (!pickTarget) return null;
        const from = planetIndex.get(pickTarget);
        const items = [];
        for (const g of galaxies) {
          for (const p of g.planets) {
            if (p.id === pickTarget) continue;
            items.push({ p, g, score: p.updatedAt || 0 });
          }
        }
        items.sort((a, b) => b.score - a.score);
        return h('div', { key: 'picker', className: 'xgv-card', style: { left: Math.max(8, box.w / 2 - 180), top: 24, width: 360, maxHeight: box.h - 60 }, onClick: (e) => e.stopPropagation() }, [
          h('div', { key: 'head', className: 'xgv-card-head' }, [
            h('div', { key: 'title', className: 'xgv-card-title' }, t('link.pickTitle') + (from ? ' · ' + from.title : '')),
            h('div', { key: 'x', className: 'xgv-card-x', onClick: () => setPickTarget(null) }, '\u00d7'),
          ]),
          h('div', { key: 'list', className: 'xgv-list', style: { maxHeight: box.h - 190 } },
            items.slice(0, 80).map(({ p, g }) =>
              h('div', {
                key: p.id,
                className: 'xgv-row',
                onClick: () => {
                  const ok = addLink(pickTarget, p.id);
                  if (ok) setPickTarget(null);
                },
              }, [
                h('span', { key: 'd', className: 'xgv-dot ' + p.state }),
                h('span', { key: 't', className: 'xgv-row-title' }, p.title + ' · ' + g.title),
              ]),
            ),
          ),
        ]);
      };

      /* ---------- main render ---------- */
      const planetNodes = [];
      const orbitNodes = [];
      const starNodes = [];
      for (const g of galaxies) {
        /* 一个星系的所有轨道环放进同一个 <g>：局部坐标画在 0,0，位置与缩放每帧由投影写入。 */
        orbitNodes.push(h('g', {
          key: 'og-' + g.id,
          ref: (el) => {
            if (!el) {
              orbitRefs.current.delete(g.id);
              return;
            }
            orbitRefs.current.set(g.id, el);
          },
          transform: 'translate(0 0)',
        }, g.planets.map((p) => h('ellipse', {
          key: 'o-' + p.id,
          cx: 0,
          cy: 0,
          rx: p.r,
          ry: p.r * g.tilt,
          fill: 'none',
          stroke: 'rgba(120, 165, 255, 0.13)',
          strokeWidth: 0.7,
          style: { pointerEvents: 'none' },
        }))));
        starNodes.push(h('g', {
          key: 's-' + g.id,
          'data-galaxy': g.id,
          className: 'xgv-star',
          transform: 'translate(0 0)',
          style: { cursor: 'pointer' },
          ref: (el) => {
            if (!el) {
              starArtRef.current.delete(g.id);
              return;
            }
            starArtRef.current.set(g.id, {
              el,
              img: el.querySelector('.xgv-star-sprite'),
              aura: el.querySelector('.xgv-star-aura'),
              base: g.starSize * 7.2,
              /* 相位/转速都由 id 派生：同一颗星每次都一致，不同星错开。 */
              phase: hash01(g.id + '#ph') * 6.2832,
              spin: 0.018 + hash01(g.id + '#sp') * 0.022,
            });
          },
          onMouseEnter: (e) => setHover({ kind: 'galaxy', title: g.title, x: e.clientX, y: e.clientY }),
          onMouseLeave: () => setHover(null),
          onClick: (e) => {
            e.stopPropagation();
            if (performance.now() < suppressRef.current) return;
            if (linkFrom) return;
            showGalaxyCard(g.id, e.clientX, e.clientY);
          },
          onDoubleClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (performance.now() < suppressRef.current) return;
            focusGalaxy(g.id);
          },
          onContextMenu: (e) => {
            e.preventDefault();
            e.stopPropagation();
            const pt = stagePoint(e.clientX, e.clientY);
            setMenu({ kind: 'galaxy', id: g.id, path: g.path, x: pt.x, y: pt.y });
          },
        }, [
          h('circle', { key: 'aura', className: 'xgv-star-aura', r: g.starSize * 7.2, fill: 'url(#xgv-star-aura)', style: { pointerEvents: 'none' } }),
          /* 贴图还是那张球面贴图，只是缩到光点大小，亮的核靠上面的渐变圆点住。 */
          h('image', {
            key: 'sprite',
            className: 'xgv-star-sprite',
            href: STAR_SPRITES[g.variant] || STAR_SPRITES[0],
            x: -g.starSize * 2.1,
            y: -g.starSize * 2.1,
            width: g.starSize * 4.2,
            height: g.starSize * 4.2,
            preserveAspectRatio: 'xMidYMid meet',
            style: { pointerEvents: 'none' },
          }),
          h('circle', { key: 'core', r: g.starSize * 0.72, fill: 'url(#xgv-star-core)', style: { pointerEvents: 'none' } }),
          h('circle', { key: 'hit', r: g.starSize * 2.4, fill: 'transparent' }),
          h('text', { key: 'label', y: -g.starSize * 2.4 - 10, className: 'xgv-star-label' }, truncate(g.title, 18)),
        ]));
      }
      for (const g of galaxies) {
        for (const p of g.planets) {
          const ex0 = Math.cos(p.a0) * p.r;
          const ey0 = Math.sin(p.a0) * p.r * g.tilt;
          const ci0 = Math.cos(g.inc);
          const si0 = Math.sin(g.inc);
          const x0 = g.x + ex0 * ci0 - ey0 * si0;
          const y0 = g.y + ex0 * si0 + ey0 * ci0;
          const ringColor = p.archived
            ? 'rgba(150, 160, 180, 0.45)'
            : p.state === 'pending'
              ? 'rgba(255, 209, 102, 0.85)'
              : p.state === 'running'
                ? 'rgba(126, 241, 208, 0.85)'
                : 'rgba(130, 160, 210, 0.3)';
          const bodyColor = p.archived
            ? '#5a6782'
            : p.state === 'pending'
              ? '#ffd166'
              : p.state === 'running'
                ? '#7ef1d0'
                : '#9fc6ff';
          planetNodes.push(h('g', {
            key: 'p-' + p.id,
            'data-session': p.id,
            className: 'xgv-planet' + (p.archived ? ' is-archived' : ''),
            transform: 'translate(' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ')',
            ref: (el) => {
              if (el) planetRefs.current.set(p.id, el);
              else planetRefs.current.delete(p.id);
            },
            onClick: (e) => {
              e.stopPropagation();
              if (movedRef.current) return;
              if (linkFrom) {
                addLink(linkFrom, p.id);
                setLinkFrom(null);
                return;
              }
              showSessionCard(p.id, e.clientX, e.clientY);
            },
            onMouseEnter: (e) => setHover({ kind: 'session', title: p.title, state: p.state, x: e.clientX, y: e.clientY }),
            onMouseLeave: () => setHover(null),
            onDoubleClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
              if (movedRef.current || performance.now() < suppressRef.current) return;
              openSession(p.id);
            },
            onContextMenu: (e) => {
              e.preventDefault();
              e.stopPropagation();
              const pt = stagePoint(e.clientX, e.clientY);
              setMenu({ kind: 'session', id: p.id, x: pt.x, y: pt.y });
            },
          }, [
            h('circle', { key: 'halo', r: p.size * 2.8, fill: 'url(#xgv-planet-halo)', opacity: 0.34 + p.heat * 0.5, style: { pointerEvents: 'none' } }),
            h('circle', { key: 'body', r: p.size, fill: bodyColor, opacity: 0.7, style: { pointerEvents: 'none' } }),
            h('image', {
              key: 'sprite',
              href: PLANET_SPRITES[p.variant] || PLANET_SPRITES[0],
              x: -p.size * 2.6,
              y: -p.size * 2.6,
              width: p.size * 5.2,
              height: p.size * 5.2,
              preserveAspectRatio: 'xMidYMid meet',
              style: { pointerEvents: 'none' },
            }),
            h('circle', { key: 'hit', r: p.size * 2.9, fill: 'transparent' }),
            h('ellipse', {
              key: 'ring',
              rx: p.size * 1.95,
              ry: p.size * 0.62,
              fill: 'none',
              stroke: ringColor,
              strokeWidth: 0.85,
              style: { pointerEvents: 'none' },
            }),
            h('text', { key: 'label', x: p.size + 5, y: 3.2, className: 'xgv-planet-label' }, truncate(p.title, 16)),
          ]));
        }
      }

      const existing = new Set();
      for (const g of galaxies) for (const p of g.planets) existing.add(p.id);
      const edgeNodes = [];
      linkRefs.current = new Map();
      for (const [a, b] of links) {
        if (!existing.has(a) || !existing.has(b)) continue;
        const key = a + '|' + b;
        edgeNodes.push(h('path', {
          key: 'e-' + key,
          className: 'xgv-link',
          fill: 'none',
          stroke: 'rgba(126, 225, 255, 0.55)',
          strokeWidth: 1.3,
          ref: (el) => { if (el) { el.__pair = [a, b]; linkRefs.current.set(key, el); } else linkRefs.current.delete(key); },
          onContextMenu: (e) => {
            e.preventDefault();
            e.stopPropagation();
            const pt = stagePoint(e.clientX, e.clientY);
            setMenu({ kind: 'link', a, b, x: pt.x, y: pt.y });
          },
        }));
      }

      const draggingPath = h('line', {
        key: 'drag',
        ref: dragRef,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        stroke: 'rgba(150, 240, 255, 0.75)',
        strokeWidth: 1.4,
        strokeDasharray: '5 5',
        style: { pointerEvents: 'none', display: 'none' },
      });

      const empty = galaxies.length === 0;

      return h('div', { className: 'xgv-root', ref: (el) => { rootEl = el; }, style: { paddingTop: topInset + 'px' }, onClick: () => { setMenu(null); setCard(null); } }, [
        h('style', { key: 'css' }, CSS),
        h('div', { key: 'top', className: 'xgv-top' }, [
          h('div', {
            key: 'back',
            className: 'xgv-btn xgv-back',
            title: t('panel.back'),
            onClick: (e) => { e.stopPropagation(); if (act.back) act.back(); },
          }, '←'),
          h('div', { key: 'brand', className: 'xgv-brand' }, [
            h('svg', { key: 'ico', width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none' }, [
              h('circle', { key: 'a', cx: 12, cy: 12, r: 3.2, fill: '#ffe6a3' }),
              h('circle', { key: 'b', cx: 12, cy: 12, r: 8.4, stroke: 'rgba(140,190,255,0.55)', strokeWidth: 1, strokeDasharray: '2.4 3.2' }),
              h('circle', { key: 'c', cx: 19.6, cy: 10.2, r: 1.5, fill: '#7ef1d0' }),
              h('circle', { key: 'd', cx: 6.1, cy: 16.4, r: 1.2, fill: '#9fc6ff' }),
            ]),
            h('span', { key: 's' }, t('panel.title')),
            h('small', { key: 'n' }, t('panel.subtitle', { w: galaxies.length, s: sessionCount })),
          ]),
          h('div', { key: 'search', className: 'xgv-search' }, [
            h('svg', { key: 'i', className: 'xgv-search-icon', viewBox: '0 0 24 24', fill: 'none' }, [
              h('circle', { key: 'c', cx: 11, cy: 11, r: 6.4, stroke: '#9fb8e0', strokeWidth: 1.8 }),
              h('path', { key: 'l', d: 'M16 16 L21 21', stroke: '#9fb8e0', strokeWidth: 1.8, strokeLinecap: 'round' }),
            ]),
            h('input', {
              key: 'in',
              ref: searchRef,
              value: query,
              placeholder: t('search.placeholder'),
              onChange: (e) => setQuery(e.target.value),
              onKeyDown: onSearchKey,
              onFocus: () => { if (query) setActiveResult(0); },
            }),
            query ? h('div', { key: 'res', className: 'xgv-results', onClick: (e) => e.stopPropagation() },
              searchResults.length === 0
                ? h('div', { key: 'none', className: 'xgv-none' }, t('search.empty'))
                : searchResults.map((item, idx) =>
                  h('div', {
                    key: item.kind + ':' + item.id,
                    className: 'xgv-result' + (idx === activeResult ? ' is-active' : ''),
                    onMouseEnter: () => setActiveResult(idx),
                    onClick: () => chooseResult(item),
                  }, [
                    h('span', { key: 'd', className: 'xgv-result-dot', style: { background: item.kind === 'galaxy' ? '#ffe6a3' : '#7ea8ff' } }),
                    h('span', { key: 't', className: 'xgv-result-title' }, item.title),
                    h('span', { key: 's', className: 'xgv-result-sub' }, truncate(item.sub || '', 34)),
                    h('span', { key: 'k', className: 'xgv-result-kind' }, t(item.kind === 'galaxy' ? 'search.workspace' : 'search.session')),
                  ]),
                ),
            ) : null,
          ]),
          h('div', { key: 'tools', className: 'xgv-tools' }, [
            h('select', {
              key: 'mode',
              className: 'xgv-mode',
              title: t('mode.label'),
              value: mode,
              onClick: (e) => e.stopPropagation(),
              onChange: (e) => { e.stopPropagation(); changeMode(e.target.value); },
            }, [
              h('option', { key: 'r', value: 'realtime' }, t('mode.realtime')),
              h('option', { key: 't', value: 'turn' }, t('mode.turn')),
              h('option', { key: 'o', value: 'off' }, t('mode.off')),
            ]),
            h('div', { key: 'zo', className: 'xgv-btn', title: t('zoom.out'), onClick: (e) => { e.stopPropagation(); const z = targetRef.current; z.k = clamp(z.k / 1.3, 0.06, 6); easeRef.current = 0.22; } }, '−'),
            h('div', { key: 'zv', className: 'xgv-zoomval' }, zoomPct + '%'),
            h('div', { key: 'zi', className: 'xgv-btn', title: t('zoom.in'), onClick: (e) => { e.stopPropagation(); const z = targetRef.current; z.k = clamp(z.k * 1.3, 0.06, 6); easeRef.current = 0.22; } }, '+'),
            h('div', { key: 'fit', className: 'xgv-btn', title: t('zoom.fit'), onClick: (e) => { e.stopPropagation(); fitAll(); } }, t('zoom.fit')),
          ]),
        ]),
        h('div', {
          key: 'stage',
          ref: stageRef,
          className: 'xgv-stage' + (panning ? ' is-panning' : '') + (linkFrom ? ' is-linking' : ''),
          onPointerDown: onPointerDown,
          onPointerMove: onPointerMove,
          onPointerUp: endGesture,
          onPointerCancel: endGesture,
          onDoubleClick: (e) => {
            /* 双击恒星的引力范围（而不是只有星点本身）就把镜头推近该星系；空白处回到全景。 */
            if (movedRef.current || performance.now() < suppressRef.current) return;
            const pt = stagePoint(e.clientX, e.clientY);
            /* 星系带深度了：屏幕上的引力范围 = 世界半径 × 深度缩放 × 相机缩放。 */
            let hit = null;
            for (const g of galaxies) {
              const pr = screenRef.current.get(g.id);
              if (!pr) continue;
              const rScreen = Math.max(26, g.radius * pr.s * viewRef.current.k * 1.05);
              if (Math.hypot(pt.x - pr.x, pt.y - pr.y) <= rScreen) {
                hit = g;
                break;
              }
            }
            if (hit) focusGalaxy(hit.id);
            else fitAll();
          },
          onContextMenu: (e) => { e.preventDefault(); },
        }, [
          h('svg', { key: 'svg', className: 'xgv-svg', width: '100%', height: '100%' }, [
            h('defs', { key: 'defs' }, [
              h('radialGradient', { key: 'gh', id: 'xgv-star-halo' }, [
                h('stop', { key: 'a', offset: '0%', stopColor: 'rgba(255, 232, 170, 0.85)' }),
                h('stop', { key: 'b', offset: '45%', stopColor: 'rgba(255, 196, 92, 0.26)' }),
                h('stop', { key: 'c', offset: '100%', stopColor: 'rgba(255, 180, 60, 0)' }),
              ]),
              h('radialGradient', { key: 'ph', id: 'xgv-planet-halo' }, [
                h('stop', { key: 'a', offset: '0%', stopColor: 'rgba(160, 210, 255, 0.5)' }),
                h('stop', { key: 'b', offset: '100%', stopColor: 'rgba(120, 180, 255, 0)' }),
              ]),
              h('radialGradient', { key: 'nb1', id: 'xgv-neb1' }, [
                h('stop', { key: 'a', offset: '0%', stopColor: 'rgba(88, 70, 200, 0.30)' }),
                h('stop', { key: 'b', offset: '100%', stopColor: 'rgba(60, 40, 160, 0)' }),
              ]),
              h('radialGradient', { key: 'nb2', id: 'xgv-neb2' }, [
                h('stop', { key: 'a', offset: '0%', stopColor: 'rgba(30, 120, 190, 0.24)' }),
                h('stop', { key: 'b', offset: '100%', stopColor: 'rgba(20, 90, 160, 0)' }),
              ]),
              h('radialGradient', { key: 'au', id: 'xgv-star-aura' }, [
                h('stop', { key: 'a', offset: '0%', stopColor: 'rgba(255, 228, 168, 0.26)' }),
                h('stop', { key: 'b', offset: '34%', stopColor: 'rgba(255, 194, 96, 0.09)' }),
                h('stop', { key: 'c', offset: '100%', stopColor: 'rgba(255, 170, 60, 0)' }),
              ]),
              /* 白心向外化开的亮点，盖在缩小的球面贴图上，把它变成"一个亮点"。 */
              h('radialGradient', { key: 'core', id: 'xgv-star-core' }, [
                h('stop', { key: 'a', offset: '0%', stopColor: 'rgba(255, 255, 255, 0.98)' }),
                h('stop', { key: 'b', offset: '45%', stopColor: 'rgba(255, 244, 214, 0.6)' }),
                h('stop', { key: 'c', offset: '100%', stopColor: 'rgba(255, 220, 150, 0)' }),
              ]),
            ]),
            h('g', { key: 'sky', className: 'xgv-nebula', style: { pointerEvents: 'none' } }, [
              h('ellipse', { key: 'n1', cx: box.w * 0.24, cy: box.h * 0.22, rx: box.w * 0.42, ry: box.h * 0.36, fill: 'url(#xgv-neb1)' }),
              h('ellipse', { key: 'n2', cx: box.w * 0.82, cy: box.h * 0.74, rx: box.w * 0.38, ry: box.h * 0.4, fill: 'url(#xgv-neb2)' }),
              h('ellipse', { key: 'n3', cx: box.w * 0.58, cy: box.h * 0.34, rx: box.w * 0.26, ry: box.h * 0.3, fill: 'url(#xgv-neb1)', opacity: 0.55 }),
              h('ellipse', { key: 'n4', cx: box.w * 0.12, cy: box.h * 0.86, rx: box.w * 0.3, ry: box.h * 0.26, fill: 'url(#xgv-neb2)', opacity: 0.6 }),
            ]),
            /* 星点层：屏幕空间的固定星点，闪自己的，不跟相机。 */
            h('g', { key: 'dust', className: 'xgv-dustfield', style: { pointerEvents: 'none' } },
              dust.map((p) => h('circle', {
                key: p.key,
                cx: p.x,
                cy: p.y,
                r: p.r,
                fill: '#dfe8ff',
                style: { '--o': p.o, animationDelay: '-' + p.d + 's' },
              }))),
            /* 球壳经纬线 + 球面点云：整颗球的骨架。
               每条线拆成远/近两条，背面的压暗、正面的提亮，前后才分得开。 */
            h('g', { key: 'globe', className: 'xgv-globe', style: { pointerEvents: 'none' } }, [
              h('g', { key: 'rings' }, globe.rings.map((pts, i) => h('g', { key: 'gr' + i }, [
                h('path', {
                  key: 'f',
                  fill: 'none',
                  stroke: 'rgba(118, 162, 255, 0.07)',
                  strokeWidth: 0.9,
                  ref: (el) => {
                    if (!el) return;
                    if (!globeRefs.current[i]) globeRefs.current[i] = { far: null, near: null };
                    globeRefs.current[i].far = el;
                  },
                }),
                h('path', {
                  key: 'n',
                  fill: 'none',
                  stroke: 'rgba(154, 200, 255, 0.34)',
                  strokeWidth: 1.2,
                  ref: (el) => {
                    if (!el) return;
                    if (!globeRefs.current[i]) globeRefs.current[i] = { far: null, near: null };
                    globeRefs.current[i].near = el;
                  },
                }),
              ]))),
              h('path', {
                key: 'dots-far',
                fill: 'rgba(146, 186, 255, 0.13)',
                ref: (el) => { globeDotsRef.current.far = el; },
              }),
              h('path', {
                key: 'dots-near',
                fill: 'rgba(198, 224, 255, 0.62)',
                ref: (el) => { globeDotsRef.current.near = el; },
              }),
            ]),
            /* 边缘光：正交投影下球永远是圆，一圈淡蓝把轮廓托出来，
               有这个圆环，转动时"这是颗球"才立得住。 */
            h('circle', {
              key: 'rim',
              ref: rimRef,
              fill: 'none',
              stroke: 'rgba(140, 190, 255, 0.3)',
              strokeWidth: 1.6,
              style: { pointerEvents: 'none' },
            }),
            /* 球心的核心：所有星系绕它转，给旋转一个明确的中心。 */
            h('g', { key: 'core', ref: coreRef, style: { pointerEvents: 'none' } }, [
              h('circle', { key: 'a', r: 52, fill: 'url(#xgv-star-aura)', opacity: 0.55 }),
              h('circle', { key: 'b', r: 3.6, fill: '#fff6dd' }),
            ]),
            h('g', { key: 'cam', ref: camRef }, [
              h('g', { key: 'orbits' }, orbitNodes),
              h('g', { key: 'edges' }, edgeNodes),
              draggingPath,
              h('g', { key: 'stars' }, starNodes),
              h('g', { key: 'planets' }, planetNodes),
            ]),
          ]),
          empty ? h('div', { key: 'empty', className: 'xgv-empty' }, [
            h('b', { key: 't' }, t('empty.title')),
            h('span', { key: 'b' }, t('empty.body')),
          ]) : null,
          linkFrom ? h('div', { key: 'hint', className: 'xgv-hint' }, t('link.hint')) : null,
          toast ? h('div', { key: 'toast', className: 'xgv-toast' }, toast) : null,
          renderCard(),
          renderMenu(),
          renderPicker(),
          hover ? h('div', {
            key: 'tip',
            className: 'xgv-tip',
            style: { left: (hover.x + 16) + 'px', top: (hover.y - 14) + 'px' },
          }, [
            h('span', { key: 't' }, hover.title),
            hover.state ? h('em', { key: 's', className: 'xgv-tip-state' }, t('state.' + hover.state)) : null,
          ]) : null,
        ]),
      ]);
    }

    function fmtRel(ts, t) {
      if (!ts) return t('time.unknown');
      const diff = Date.now() - ts;
      if (diff < 45000) return t('time.now');
      if (diff < 3600000) return t('time.min', { n: Math.max(1, Math.round(diff / 60000)) });
      if (diff < 86400000) return t('time.hour', { n: Math.max(1, Math.round(diff / 3600000)) });
      if (diff < 2592000000) return t('time.day', { n: Math.max(1, Math.round(diff / 86400000)) });
      try {
        return new Date(ts).toLocaleDateString();
      } catch (e) {
        return t('time.unknown');
      }
    }

    function PanelIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 18;
      const active = !!props.active;
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        style: { display: 'block', opacity: active ? 1 : 0.82 },
        'aria-hidden': true,
      }, [
        h('circle', { key: 'star', cx: 12, cy: 12, r: 3, fill: active ? '#ffe6a3' : 'currentColor' }),
        h('circle', { key: 'o1', cx: 12, cy: 12, r: 8.6, stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '2 3', opacity: 0.6 }),
        h('circle', { key: 'p1', cx: 20.1, cy: 9.4, r: 1.5, fill: '#7ef1d0' }),
        h('circle', { key: 'p2', cx: 5.2, cy: 16.2, r: 1.2, fill: '#9fc6ff' }),
      ]);
    }

    /* ---------------------------------------------------------------- module */
    return {
      name: 'dsh-xinghe-view',
      inject: ['slots'],
      apply(ctx) {
        let lang = 'zh';
        try {
          const raw = ctx.locale && typeof ctx.locale.getLocale === 'function' ? ctx.locale.getLocale() : '';
          if (String(raw || '').toLowerCase().startsWith('en')) lang = 'en';
        } catch (e) {
          /* locale is optional */
        }
        const t = makeT(lang);

        try {
          if (ctx.locale && typeof ctx.locale.register === 'function') {
            for (const code of Object.keys(DICT)) {
              try {
                ctx.locale.register(NS, code, DICT[code]);
              } catch (e) {
                /* a single-locale registration failure must not disable the page */
              }
            }
          }
        } catch (e) {
          /* locale service unavailable */
        }

        /* layout / uiWorkspace 不在模块 inject 列表里，得用 ctx.inject 等它们就绪；
           直接读 ctx.layout 拿到的是 undefined，返回键会静默失效。 */
        let layoutSvc = null;
        let workspaceSvc = null;
        try {
          ctx.inject(['layout'], (c) => { layoutSvc = c.layout; });
        } catch (e) {
          /* layout service optional */
        }
        try {
          ctx.inject(['uiWorkspace'], (c) => { workspaceSvc = c.uiWorkspace; });
        } catch (e) {
          /* workspace navigation optional */
        }
        const layoutOf = () => layoutSvc || ctx.layout || null;

        /* 离开面板：先淡出，再切到会话——硬切会闪一下。 */
        const leave = (fn) => {
          if (leaving) return;
          leaving = true;
          const done = () => {
            leaving = false;
            try {
              fn();
            } catch (e) {
              /* navigation failure leaves the galaxy view in place */
            }
            /* 面板可能只是被隐藏而不是卸载：过一会儿把淡出类清掉，下次进来不会残留透明。 */
            window.setTimeout(() => {
              if (rootEl) rootEl.classList.remove('is-leaving');
            }, 460);
          };
          if (rootEl) {
            rootEl.classList.add('is-leaving');
            window.setTimeout(done, 150);
          } else {
            done();
          }
        };

        const actions = {
          back() {
            leave(() => {
              /* 面板若只是被隐藏而不是卸载，cleanup 不会跑，这里补一次恢复。 */
              try { setWallpaperPaused(false); } catch (e) { /* optional */ }
              const l = layoutOf();
              if (l && typeof l.selectPanel === 'function') l.selectPanel('conversation');
            });
          },
          toggleSidebar() {
            try {
              const l = layoutOf();
              if (l && typeof l.toggleSidebar === 'function') l.toggleSidebar();
            } catch (e) {
              /* the layout service may be unavailable */
            }
          },
          openSession(sid) {
            leave(() => {
              try { setWallpaperPaused(false); } catch (e) { /* optional */ }
              const w = workspaceSvc || ctx.uiWorkspace || null;
              try {
                if (w && typeof w.openSession === 'function') w.openSession(sid);
              } catch (e) {
                /* navigation failure leaves the galaxy view in place */
              }
              try {
                const l = layoutOf();
                if (l && typeof l.selectPanel === 'function') l.selectPanel('conversation');
              } catch (e) {
                /* the panel may already be the conversation */
              }
            });
          },
          copy(text) {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(String(text || ''));
                return;
              }
            } catch (e) {
              /* fall through */
            }
            try {
              const area = document.createElement('textarea');
              area.value = String(text || '');
              area.style.position = 'fixed';
              area.style.opacity = '0';
              document.body.appendChild(area);
              area.select();
              document.execCommand('copy');
              document.body.removeChild(area);
            } catch (e) {
              /* clipboard is best effort */
            }
          },
        };

        const page = (props) => h(GalaxyPage, Object.assign({}, props, { t, actions }));

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, page));

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 60,
          label: () => t('panel.title'),
          locale: NS,
        }, (props) => h(PanelIcon, { size: props.size, active: props.active })));
      },
    };
  },
});
