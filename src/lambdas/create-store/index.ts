import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { StoreStore } from '../../repositories/store/store-store';
import { StoreService } from '../../services/store/store-service';
import { PostStoreHandler } from '../../controllers/store/post-store-handler';
import { Guarantee } from '../../controllers/utils/guarantee';
import { handleError } from '../../controllers/sentinel';

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const storeStore = new StoreStore(queryAgent);
const storeService = new StoreService(storeStore);
const postStoreHandler = new PostStoreHandler(storeService);
const guarantee = new Guarantee(postStoreHandler);
guarantee.rescue(handleError);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
