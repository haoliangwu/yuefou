#! /bin/bash 

rsync -avzP --delete --exclude node_modules ./ ubuntu@prisma.littlelyon.com:/home/ubuntu/lyon/yuefou