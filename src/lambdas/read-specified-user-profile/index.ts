import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { GoogleSignInProvider } from '../../providers/thrid-party-sign-in-provider/google-sign-in-provider';
import { MomentProvider } from '../../providers/date-provider/moment-provider';
import { UserStore } from '../../repositories/user/user-store';
import { UserService } from '../../services/user/user-service';
import { GetSpecifiedUserProfileHandler } from '../../controllers/user/get-specified-user-profile-handler';
import { Guarantee } from '../../controllers/utils/guarantee';
import { handleError } from '../../controllers/sentinel';

const { GOOGLE_CLIENT_ID } = process.env;

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const momentProvider = new MomentProvider();
const googleSignInProvider = new GoogleSignInProvider(GOOGLE_CLIENT_ID, momentProvider);
const userStore = new UserStore(queryAgent, momentProvider);
const userService = new UserService(userStore, googleSignInProvider, momentProvider);
const getSpecifiedUserCommentsHandler = new GetSpecifiedUserProfileHandler(userService);

const guarantee = new Guarantee(getSpecifiedUserCommentsHandler);
guarantee.rescue(handleError);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
