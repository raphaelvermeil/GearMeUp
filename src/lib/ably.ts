import { Realtime } from 'ably';

const ably = new Realtime({
  key: "lxNEZg.uos_Kg:p8IT9y__A7jo2cpHjmbdy9JiIsgOT7RLhIqjDieBoBI",
  clientId: Math.random().toString(36).substring(2, 15), // Generate a random client ID
});

export default ably;